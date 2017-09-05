let express = require('express');
let router = express.Router();
let fs = require('fs');
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

function getUsers(callback){
  let jsonPath = path.join(__dirname, '..', 'data', 'users.json');
  fs.readFile(jsonPath, 'utf8', callback);
}

module.exports = router;
