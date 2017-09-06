let express = require('express');
let router = express.Router();
require('dotenv').config();

const auto_stocks = ["F","TSLA","FCAU","TM","HMC","RACE","CARZ"];
const airline_stocks = ["AAL","DAL","UAL","SKYW","JBLU","ALK","LUV","JETS"];
const hotel_stocks = ["MAR", "HLT", "H", "MGM", "LVS", "WYN", "WYNN", "STAY", "IHG"];

router.get('/', function(req, res, next) {
  res.json({
    "Auto": list(auto_stocks),
    "Airlines": list(airline_stocks),
    "Hotels": list(hotel_stocks),
    "Tech": [
      {id: 'AMZN', name: 'Amazon'},
      {id: 'GOOGL', name: 'Alphabet Inc.'},
      {id: 'AAPL', name: 'Apple Inc.'}
    ]
  });
});

// dashDB query
let ibmdb = require("ibm_db"),
  connString =  ";HOSTNAME="+process.env.DB_HOST+ ";PORT="+process.env.DB_PORT+
                ";UID=" +process.env.DB_USER+";PWD="+process.env.DB_PASS+
                ";DATABASE="+process.env.DB_BASE+";PROTOCOL=TCPIP";
const queryString = "SELECT SYMBOL,TRADE_DATE,CLOSE_PRICE from STOCK_TRADES WHERE (\"SYMBOL\"='X' " +
  "AND TRADE_DATE >= '2014-08-18' AND TRADE_DATE <= '2017-08-11') ORDER BY TRADE_DATE";
const pos = queryString.indexOf('X');

router.get('/:stock', function(req, res, next) {

  ibmdb.open(connString, function (err, conn) {
    if (err) return console.log(err);

    let query = queryString.slice(0, pos) + req.params.stock + queryString.slice(pos+1);
    conn.query(query, function (err, data) {
      if (err) console.log(err);
      else{
        if (data.length > 0 && data[0]['SYMBOL'] === req.params.stock) {
          res.json({
            stock: req.params.stock,
            dates: data.map(function(x){ return x['TRADE_DATE']; }),
            prices: data.map(function(x){ return x['CLOSE_PRICE']; })
          });
        } else {
          res.json({ stock: req.params.stock, dates: [], prices: [] });
        }
      }
      conn.close(function () { console.log('done'); });
    });
  });
});

function list(stocks){
  return stocks.map(function(stock) { return {
    id: stock,
    name: stock
  }});
}

module.exports = router;
