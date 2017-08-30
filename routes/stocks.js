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
      '2017-08-03',
      '2017-08-04',
      '2017-08-05',
      '2017-08-06',
      '2017-08-07'
    ],
    prices: [1,2,3,4,5,6,7].map(function(x){
      return Math.random() * 10 + 1;
    })
  });
});

function list(stocks){
  return stocks.map(function(stock) { return {
    id: stock,
    name: stock
  }});
}

module.exports = router;
