let express = require('express');
let router = express.Router();
let fs = require('fs');
let path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  let jsonPath = path.join(__dirname, '..', 'data', 'users.json');
  fs.readFile(jsonPath, 'utf8', function(err, data) {
    res.json(JSON.parse(data));
  });
});

module.exports = router;
