var express = require('express');
var router = express.Router();

const auto_stocks = ["F","TSLA","FCAU","TM","HMC","RACE","CARZ"];
const airline_stocks = ["DAL","UAL","SKYW","JBLU","ALK","LUV","JETS"];
const hotel_stocks = ["MAR", "HLT", "H", "MGM", "LVS", "WYN", "WYNN", "STAY", "IHG"];

router.get('/', function(req, res, next) {
  res.json({
    "auto_stocks": list(auto_stocks),
    "airline_stocks": list(airline_stocks),
    "hotel_stocks": list(airline_stocks)
  });
});

router.get('/auto', function(req, res, next) {
  res.json(list(auto_stocks));
});

router.get('/airlines', function(req, res, next) {
  res.json(list(airline_stocks));
});

function list(stocks){
  return stocks.map(function(stock) { return {
    id: stock.toLowerCase(),
    name: stock
  }});
}

module.exports = router;
