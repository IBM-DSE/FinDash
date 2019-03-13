const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = (process.env.DB_HOST && process.env.DB_PORT &&
            process.env.DB_USER && process.env.DB_PASS &&
            process.env.DB_BASE) ? require('../db/ibm-db') : require('../db/sqlite-db');


// users reference object
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'db', 'users.json'), 'utf8'));


/* GET clients listing. */
router.get('/', function(req, res) {
  const clients = users['clients'];
  const ids = clients.map(client => client.id);

  db.queryDatabase("SELECT CustID, AccountBalance FROM BROKERAGE_CUST WHERE CustID IN (" + ids + ")",
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


/* GET client by id. */
router.get('/:id', async function(req, res) {

  const clientID = req.params.id;

  const client = users['clients'].filter((client) => client.id === clientID)[0];

  db.queryDatabase( "SELECT * FROM BROKERAGE_CUST WHERE \"CustID\"="+clientID,
    (clientDetails) => {
      Object.assign(client, clientDetails[0]);
      res.json(client);
    }
  );
});


module.exports = router;
