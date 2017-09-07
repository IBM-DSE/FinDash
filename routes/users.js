let express = require('express');
let router = express.Router();
let fs = require('fs');
let csv_parse = require('csv-parse/lib/sync');
let path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(getUsers());
});

router.get('/clients', async function(req, res, next) {
  let clients = getUsers()['clients'];
  let client_details = await getClients();
  await clients.forEach(function(client){
    client['acc_bal'] = client_details[client['id']]['AccountBalance'];
  });
  res.json(clients);
});

router.get('/clients/:id', async function(req, res, next) {

  let client = getUsers()['clients'].filter(function(client) {
    return client.id === req.params.id;
  })[0];

  if(!client) return res.json({});

  let client_details = await getClients();
  Object.assign(client, client, client_details[req.params.id]);

  res.json(client);
});

function getUsers() {
  let jsonPath = path.join(__dirname, '..', 'data', 'users.json');
  let fileData = fs.readFileSync(jsonPath, 'utf8');
  return JSON.parse(fileData);
}

async function getClients() {
  let csvPath = path.join(__dirname, '..', 'data', 'cust_slice.csv');
  let file_data = fs.readFileSync(csvPath, 'utf8');
  let rows = csv_parse(file_data);

  let clients = {};
  let header = rows[0];
  await rows.forEach(function(row, i){
    if(i>0) clients[row[0]] = row.reduce(function(acc, cur, i) {
      acc[header[i]] = cur;
      return acc;
    }, {});;
  });
  return clients;
}

module.exports = router;
