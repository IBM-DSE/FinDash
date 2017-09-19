let express = require('express');
let router = express.Router();
let fs = require('fs');
let csv_parse = require('csv-parse/lib/sync');
let path = require('path');
let ibmDB = require('../db/ibm-db');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(getUsers());
});

router.get('/clients', function(req, res, next) {
  let clients = getUsers()['clients'];
  let ids = clients.map(client => client.id);

  ibmDB.queryDatabase("SELECT \"CustID\", \"AccountBalance\" FROM BROKERAGE_CUST WHERE \"CustID\" IN (" + ids + ")",
    async (clientDetails) => {
      clientDetails = clientDetails.reduce((acc, client) => {
        acc[client.CustID] = client.AccountBalance;
        return acc;
      }, {});
      await clients.forEach((client) => client['acc_bal'] = clientDetails[client.id]);
      res.json(clients);
    }
  );
});

router.get('/clients/:id', async function(req, res, next) {

  let clientID = req.params.id;

  let client = getUsers()['clients'].filter((client) => client.id === clientID)[0];

  ibmDB.queryDatabase( "SELECT * FROM BROKERAGE_CUST WHERE \"CustID\"="+clientID,
    (clientDetails) => {
      Object.assign(client, clientDetails[0]);
      res.json(client);
    }
  );
});

function getUsers() {
  let jsonPath = path.join(__dirname, '..', 'db', 'users.json');
  let fileData = fs.readFileSync(jsonPath, 'utf8');
  return JSON.parse(fileData);
}

module.exports = router;
