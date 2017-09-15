require('dotenv').config();
let express = require('express');
let router = express.Router();
let fs = require('fs');
let path = require('path');
let csv_parse = require('csv-parse');
let ibmDB = require("ibm_db");

// dashDB query
const connString = ";HOSTNAME="+process.env.DB_HOST+";PORT="+process.env.DB_PORT+
                   ";UID="     +process.env.DB_USER+";PWD=" +process.env.DB_PASS+
                   ";DATABASE="+process.env.DB_BASE+";PROTOCOL=TCPIP";

const queryStockPrices = "SELECT SYMBOL,TRADE_DATE,CLOSE_PRICE from STOCK_TRADES WHERE (\"SYMBOL\"='X' " +
  "AND TRADE_DATE >= '2015-12-31' AND TRADE_DATE <= '2017-08-15') ORDER BY TRADE_DATE",
  pos = queryStockPrices.indexOf('X');

const queryStocks = "SELECT DISTINCT SYMBOL1, SYMBOL2 from STOCK_ANALYSIS;";

const queryStockCorrelation = "SELECT * FROM STOCK_ANALYSIS WHERE (\"SYMBOL1\"='X' AND \"SYMBOL2\"='Z') ORDER BY TRADE_DATE",
  posSym1 = queryStockCorrelation.indexOf('X'),
  posSym2 = queryStockCorrelation.indexOf('Z');

const queryCurrencyCorrelation = "SELECT * FROM CURRENCY_ANALYSIS WHERE (\"SYMBOL\"='X' AND \"CURRENCY\"='Z') ORDER BY TRADE_DATE",
  posSym = queryCurrencyCorrelation.indexOf('X'),
  posCurr = queryCurrencyCorrelation.indexOf('Z');

router.get('/', function(req, res, next) {
  res.json({
    categories: {
      "Auto": auto_stocks,
      "Airlines": airline_stocks,
      "Hotels": hotel_stocks,
      "Tech": tech_stocks,
    },
    name: mapping
  });
});

router.get('/news/', function(req, res, next) {

  let startDate = new Date(req.query.startDate);
  let endDate = new Date(req.query.endDate);

  getNews(function(err, data) {
    if(err) console.error(err);
    let header = data[0];
    let stock_news = data.slice(1);
    if(startDate && endDate){
      let date;
      stock_news = stock_news.filter(news => {
        date = new Date(news[2]);
        return date > startDate && date < endDate;
      });
    }
    stock_news = stock_news.map(function(news){
      return news.reduce(function(acc, cur, i) {
        if(i>0) acc[header[i]] = cur;
        return acc;
      }, {});
    });
    res.json(stock_news);
  });

});

router.get('/currencies', function(req, res, next) {
  res.json(currency_mapping);
});

router.get('/corr/stocks', function(req, res, next) {

  let stock1 = req.query.stock1;
  let stock2 = req.query.stock2;

  queryDatabase(queryStocks, function(pairs){
    let stocks;
    pairs.forEach((pair) => {
      stocks = Object.values(pair);
      if(stocks.includes(stock1) && stocks.includes(stock2)){

        let query  = queryStockCorrelation.slice(0, posSym1) +
          pair['SYMBOL1'] + queryStockCorrelation.slice(posSym1+1, posSym2) +
          pair['SYMBOL2'] + queryStockCorrelation.slice(posSym2+1);

        queryDatabase(query, function(data){
          if (data.length > 0 && data[0]['SYMBOL1'] === pair['SYMBOL1'] && data[0]['SYMBOL2'] === pair['SYMBOL2']) {
            res.json({
              stock1: stock1, stock2: stock2,
              dates: data.map(function(x){ return x['TRADE_DATE']; }),
              correlations: data.map(function(x){ return x['CORRELATION']; })
            });
          } else
            res.json({ stock1: stock1, stock2: stock2, dates: [], correlations: [] });
        });
      } else
        res.json({ stock1: stock1, stock2: stock2, dates: [], correlations: [] });
    });
  });

});

router.get('/corr/curr', function(req, res, next) {

  let stock = req.query.stock;
  let currency = req.query.currency;

  let query  = queryCurrencyCorrelation.slice(0, posSym) + stock +
    queryCurrencyCorrelation.slice(posSym+1, posCurr) +
    currency + queryCurrencyCorrelation.slice(posCurr+1);

  queryDatabase(query, function(data){

    if (data.length > 0 && data[0]['SYMBOL'] === req.query.stock) {
      res.json({
        stock: stock, currency: currency,
        dates: data.map(function(x){ return x['TRADE_DATE']; }),
        correlations: data.map(function(x){ return x['CORRELATION']; })
      });
    } else
    res.json({ stock: stock, currency: currency, dates: [], correlations: [] });
  });

});

router.get('/:stock', function(req, res, next) {

  let query = queryStockPrices.slice(0, pos) + req.params.stock + queryStockPrices.slice(pos+1);

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

function queryDatabase(statement, callback){

  if(!(process.env.DB_HOST && process.env.DB_PORT &&
       process.env.DB_USER && process.env.DB_PASS && process.env.DB_BASE))
    return console.error('Missing Database ');

  ibmDB.open(connString, function (err, conn) {
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

const mapping = {
  'F': 'Ford',
  'TSLA': 'Tesla',
  'FCAU': 'Fiat Chrysler',
  'TM': 'Toyota',
  'HMC': 'Honda',
  'RACE': 'Ferrari NV',
  'CARZ': 'Glbl Auto Idx',

  'AAL': 'American Airlines',
  'DAL': 'Delta Air Lines',
  'UAL': 'United Continental',
  'SKYW': 'SkyWest',
  'JBLU': 'JetBlue Airways',
  'ALK': 'Alaska Air',
  'LUV': 'Southwest Airlines',
  'JETS': 'US Global Jets ETF',

  'MAR': 'Marriott',
  'HLT': 'Hilton',
  'H': 'Hyatt',
  'MGM': 'MGM Resorts',
  'LVS': 'Las Vegas Sands',
  'WYN': 'Wyndham Worldwide',
  'WYNN': 'Wynn Resorts',
  'STAY': 'Extended Stay America',
  'IHG': 'InterContinental Hotels Group',

  'AMZN': 'Amazon',
  'GOOGL': 'Alphabet',
  'AAPL': 'Apple'
};

const currency_mapping = {
  'DEXUSEU': 'USD / EUR',
  'DEXCHUS': 'CNY / USD',
  'DEXJPUS': 'JPY / USD'
};

module.exports = router;
