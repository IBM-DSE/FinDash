require('dotenv').config();
let express = require('express');
let router = express.Router();
let fs = require('fs');
let csv_parse = require('csv-parse');
let path = require('path');
let ibmdb = require("ibm_db");

// dashDB query
const connString = ";HOSTNAME="+process.env.DB_HOST+";PORT="+process.env.DB_PORT+
                   ";UID="     +process.env.DB_USER+";PWD=" +process.env.DB_PASS+
                   ";DATABASE="+process.env.DB_BASE+";PROTOCOL=TCPIP";

const queryString = "SELECT SYMBOL,TRADE_DATE,CLOSE_PRICE from STOCK_TRADES WHERE (\"SYMBOL\"='X' " +
  "AND TRADE_DATE >= '2015-12-31' AND TRADE_DATE <= '2017-08-15') ORDER BY TRADE_DATE",
  pos = queryString.indexOf('X');

const corrStocksQuery = "SELECT DISTINCT SYMBOL1, SYMBOL2 from STOCK_ANALYSIS;";

const corrQueryString = "SELECT * FROM STOCK_ANALYSIS WHERE (\"SYMBOL1\"='X' AND \"SYMBOL2\"='Z')",
  posSym1 = corrQueryString.indexOf('X'),
  posSym2 = corrQueryString.indexOf('Z');

router.get('/', function(req, res, next) {
  res.json({
    "Auto": list(auto_stocks),
    "Airlines": list(airline_stocks),
    "Hotels": list(hotel_stocks),
    "Tech": list(tech_stocks),
    "Currency": list(currencies),
    "Sector Revenue": list(sectors),
  });
});

router.get('/corr', function(req, res, next) {

  let stock1 = req.query.stock1;
  let stock2 = req.query.stock2;

  queryDatabase(corrStocksQuery, function(pairs){
    let stocks;
    pairs.forEach((pair) => {
      stocks = Object.values(pair);
      if(stocks.includes(stock1) && stocks.includes(stock2)){

        let query  = corrQueryString.slice(0, posSym1) +
          pair['SYMBOL1'] + corrQueryString.slice(posSym1+1, posSym2) +
          pair['SYMBOL2'] + corrQueryString.slice(posSym2+1);

        queryDatabase(query, function(data){
          if (data.length > 0 && data[0]['SYMBOL'] === req.params.stock) {
            res.json({
              stock1: stock1, stock2: stock2,
              dates: data.map(function(x){ return x['TRADE_DATE']; }),
              correlation: data.map(function(x){ return x['CORRELATION']; })
            });
          } else
            res.json({ stock1: stock1, stock2: stock2, dates: [], prices: [] });
        });
      } else
        res.json({ stock1: stock1, stock2: stock2, dates: [], prices: [] });
    });
  });

});

router.get('/:stock', function(req, res, next) {

  let query = queryString.slice(0, pos) + req.params.stock + queryString.slice(pos+1);

  queryDatabase(query, function(data){
    if (data.length > 0 && data[0]['SYMBOL'] === req.params.stock) {
      res.json({
        stock: req.params.stock,
        dates: data.map(function(x){ return x['TRADE_DATE']; }),
        prices: data.map(function(x){ return x['CLOSE_PRICE']; })
      });
    } else {
      res.json({ stock: req.params.stock, dates: [], prices: [] });
    }
  });

});

router.get('/news/:stock', function(req, res, next) {
  getNews(function(err, data) {
    if(err) console.error(err);
    let header = data[0];
    let stock_news = data.filter(function(news) {
      return news[1] === req.params.stock;
    });
    stock_news = stock_news.map(function(news){
      return news.reduce(function(acc, cur, i) {
        if(i>0) acc[header[i]] = cur;
        return acc;
      }, {});
    });
    res.json(stock_news);
  });

});

function queryDatabase(statement, callback){

  if(!(process.env.DB_HOST && process.env.DB_PORT &&
       process.env.DB_USER && process.env.DB_PASS && process.env.DB_BASE))
    return console.error('Missing Database ');

  ibmdb.open(connString, function (err, conn) {
    if (err) return console.error(err);

    conn.query(statement, function (err, data) {
      if (err)
        console.log(err);
      else{
        callback(data);
      }
      conn.close(function () { console.log('done'); });
    });
  });
}

function list(stocks){
  return stocks.map(function(symbol) {return {
    id: symbol,
    name: mapping[symbol] || symbol
  }});
}

function getNews(callback) {
  let csvPath = path.join(__dirname, '..', 'data', 'stock_news.csv');
  fs.readFile(csvPath, 'utf8', function(err, file_data) {
    csv_parse(file_data, {delimiter: '|', comment: '#', quote: false}, callback);
  });
}

const auto_stocks = ['F','TSLA','FCAU','TM','HMC','RACE','CARZ'];
const airline_stocks = ['AAL','DAL','UAL','SKYW','JBLU','ALK','LUV','JETS'];
const hotel_stocks = ['MAR', 'HLT', 'H', 'MGM', 'LVS', 'WYN', 'WYNN', 'STAY', 'IHG'];
const tech_stocks = ['AMZN', 'GOOGL', 'AAPL'];
const currencies = ['EUR', 'CNY', 'JPY'];
const sectors = ['Auto', 'Airlines', 'Hotels', 'Tech'];

const mapping = {
  'F': 'Ford',
  'TSLA': 'Tesla',
  'FCAU': 'Fiat Chrysler',
  'TM': 'Toyota',
  'HMC': 'Honda',
  'RACE': 'Ferrari NV',
  'CARZ': 'Glbl Auto Idx',
  'AMZN': 'Amazon',
  'GOOGL': 'Alphabet',
  'AAPL': 'Apple'
};

module.exports = router;
