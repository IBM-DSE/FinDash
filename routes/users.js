let express = require('express');
let router = express.Router();
let fs = require('fs');
let csv = require('csv');
let path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  getUsers(function(err, data) {
    res.json(JSON.parse(data));
  });
});

router.get('/clients', function(req, res, next) {
  getUsers(function(err, data) {
    res.json(JSON.parse(data)['clients']);
  });
});

router.get('/clients/:id', function(req, res, next) {

  let client_data = {};

  getUsers(function(err, data) {
    client_data = JSON.parse(data)['clients'].filter(function(client) {
      return client.id === req.params.id;
    })[0];
    if(client_data.id){

      getClients(function(err, data) {
        let header = data[0];
        let client_details = data.filter(function(client) {
          return client[0] === req.params.id;
        })[0];
        client_details = client_details.reduce(function(acc, cur, i) {
          if(i>0) acc[header[i]] = cur;
          return acc;
        }, {});
        Object.assign(client_data, client_data, client_details);
        res.json(client_data);

      });
    }
  });

});

function getUsers(callback) {
  let jsonPath = path.join(__dirname, '..', 'data', 'users.json');
  fs.readFile(jsonPath, 'utf8', callback);
}

function getClients(callback) {
  let csvPath = path.join(__dirname, '..', 'data', 'cust_slice.csv');
  fs.readFile(csvPath, 'utf8', function(err, file_data) {
    csv.parse(file_data, callback);
  });
}

module.exports = router;
