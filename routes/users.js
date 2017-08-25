var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.json([{
    id: 1,
    name: "Tim Chef"
  }, {
    id: 2,
    name: "Jefferey Bayzos"
  }]);
});

module.exports = router;
