const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ibmDB = require('../db/ibm-db');
const sqliteDB = require('../db/sqlite-db');

const jsonPath = path.join(__dirname, '..', 'db', 'users.json');
const fileData = fs.readFileSync(jsonPath, 'utf8');
const users = JSON.parse(fileData);

/* GET users listing. */
router.get('/', function(req, res) {
  res.json(users);
});

router.get('/clients', function(req, res) {
  const clients = users['clients'];
  const ids = clients.map(client => client.id);

  sqliteDB.queryDatabase("SELECT CustID, AccountBalance FROM BROKERAGE_CUST WHERE CustID IN (" + ids + ")",
    async (clientDetails) => {
    console.log(clientDetails);
      clientDetails = clientDetails.reduce((acc, client) => {
        acc[client.CustID] = client.AccountBalance;
        return acc;
      }, {});
      await clients.forEach((client) => client['acc_bal'] = clientDetails[client.id]);
      res.json(clients);
    }
  );
});

router.get('/clients/:id', async function(req, res) {

  const clientID = req.params.id;

  const client = users['clients'].filter((client) => client.id === clientID)[0];

  ibmDB.queryDatabase( "SELECT * FROM BROKERAGE_CUST WHERE \"CustID\"="+clientID,
    (clientDetails) => {
      Object.assign(client, clientDetails[0]);
      res.json(client);
    }
  );
});


module.exports = router;
