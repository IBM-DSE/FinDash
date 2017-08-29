var express = require('express');
var router = express.Router();

const auto_stocks = ["F","TSLA","FCAU","TM","HMC","RACE","CARZ"];
const airline_stocks = ["DAL","UAL","SKYW","JBLU","ALK","LUV","JETS"];
const hotel_stocks = ["MAR", "HLT", "H", "MGM", "LVS", "WYN", "WYNN", "STAY", "IHG"];


router.get('/', function(req, res, next) {
  res.json({
    "auto_stocks": list(auto_stocks),
    "airline_stocks": list(airline_stocks),
    "hotel_stocks": list(hotel_stocks),
  });
});

router.get('/:stock', function(req, res, next) {
  res.json({
    stock: req.params.stock,
    dates: [
      '2017-08-01',
      '2017-08-02',
      '2017-08-03'
    ],
    prices: [
      22.4,
      21.2,
      25.6
    ]
  });
});

function list(stocks){
  return stocks.map(function(stock) { return {
    id: stock.toLowerCase(),
    name: stock
  }});
}

module.exports = router;
