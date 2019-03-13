let express = require('express');
let router = express.Router();
// let fs = require('fs');
// let path = require('path');
// let csv_parse = require('csv-parse');
let ibmDB = require('../db/ibm-db');

const timeFrame = "AND TRADE_DATE >= '2016-09-01' AND TRADE_DATE <= '2017-07-19'";

const queryStockPrices = "SELECT DISTINCT SYMBOL,TRADE_DATE,CLOSE_PRICE from STOCK_TRADES WHERE (\"SYMBOL\"='X' " +
  timeFrame+") ORDER BY TRADE_DATE",
  pos = queryStockPrices.indexOf('X');

const queryStocks = "SELECT DISTINCT SYMBOL1, SYMBOL2 from STOCK_ANALYSIS;";

const queryStockCorrelation = "SELECT * FROM STOCK_ANALYSIS WHERE (\"SYMBOL1\"='X' AND \"SYMBOL2\"='Z'" +
  timeFrame+") ORDER BY TRADE_DATE",
  posSym1 = queryStockCorrelation.indexOf('X'),
  posSym2 = queryStockCorrelation.indexOf('Z');

const queryCurrencyCorrelation = "SELECT * FROM CURRENCY_ANALYSIS WHERE (\"SYMBOL\"='X' AND \"CURRENCY\"='Z'" +
  timeFrame+") ORDER BY TRADE_DATE",
  posSym = queryCurrencyCorrelation.indexOf('X'),
  posCurr = queryCurrencyCorrelation.indexOf('Z');

router.get('/', function(req, res) {
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

const newsQueryStart = "SELECT MIN(NEWS_DATE) AS NEWS_DATE, MIN(NEWS_SRC) AS NEWS_SRC, MIN(NEWS_URL) AS NEWS_URL, " +
  "NEWS_TITLE, MIN(NEWS_TEXT) AS NEWS_TEXT\n" +
  "FROM NEWS\n",

  startDateClause = "NEWS_DATE >= '<START_DATE> 00:00:00.000000000'",
  indexOfStartDate = startDateClause.indexOf('<START_DATE>'),
  offsetStartDate = indexOfStartDate+'<START_DATE>'.length,

  endDateClause = "NEWS_DATE <= '<END_DATE> 05:40:00.000000000'",
  indexOfEndDate = endDateClause.indexOf('<END_DATE>'),
  offsetEndDate = indexOfEndDate+'<END_DATE>'.length,

  newsQueryEnd =  "GROUP BY NEWS_TITLE\n" +
    "ORDER BY NEWS_DATE DESC, NEWS_TITLE DESC\n" +
    "FETCH FIRST <MAX> ROWS ONLY;",
  indexOfMax = newsQueryEnd.indexOf('<MAX>'),
  offsetMax = indexOfMax+'<MAX>'.length;

router.get('/news/', function(req, res) {

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let maxRows = req.query.max || 6;

  let newsQuery = newsQueryStart;
  if(startDate || endDate){
    newsQuery += "WHERE (";
    if(startDate)
      newsQuery += startDateClause.slice(0, indexOfStartDate) + startDate + startDateClause.slice(offsetStartDate);
    if(endDate){
      if(startDate) newsQuery += " AND ";
      newsQuery += endDateClause.slice(0, indexOfEndDate) + endDate + endDateClause.slice(offsetEndDate);
    }
    newsQuery += ")\n";
  }
  newsQuery += newsQueryEnd.slice(0, indexOfMax) + maxRows + newsQueryEnd.slice(offsetMax);

  ibmDB.queryDatabase(newsQuery, stockNews => res.json(stockNews));
});

router.get('/currencies', function(req, res) {
  res.json(currency_mapping);
});

router.get('/corr/stocks', function(req, res) {

  let stock1 = req.query.stock1;
  let stock2 = req.query.stock2;

  ibmDB.queryDatabase(queryStocks, function(pairs){
    let stocks;
    pairs.forEach((pair) => {
      stocks = Object.values(pair);
      if(stocks.includes(stock1) && stocks.includes(stock2)){

        let query  = queryStockCorrelation.slice(0, posSym1) +
          pair['SYMBOL1'] + queryStockCorrelation.slice(posSym1+1, posSym2) +
          pair['SYMBOL2'] + queryStockCorrelation.slice(posSym2+1);

        ibmDB.queryDatabase(query, function(data){
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

router.get('/corr/curr', function(req, res) {

  let stock = req.query.stock;
  let currency = req.query.currency;

  let query  = queryCurrencyCorrelation.slice(0, posSym) + stock +
    queryCurrencyCorrelation.slice(posSym+1, posCurr) +
    currency + queryCurrencyCorrelation.slice(posCurr+1);

  ibmDB.queryDatabase(query, function(data){

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

router.get('/price/:stock', function(req, res) {

  let query = queryStockPrices.slice(0, pos) + req.params.stock + queryStockPrices.slice(pos+1);

  ibmDB.queryDatabase(query, function(data){
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

// function list(stocks){
//   return stocks.map(function(symbol) {return {
//     id: symbol,
//     name: mapping[symbol] || symbol
//   }});
// }
//
// function getNews(callback) {
//   let csvPath = path.join(__dirname, '..', 'data', 'stock_news.csv');
//   fs.readFile(csvPath, 'utf8', function(err, file_data) {
//     csv_parse(file_data, {delimiter: '|', comment: '#', quote: false}, callback);
//   });
// }

const auto_stocks = ['F','TSLA','FCAU','TM','HMC','RACE','CARZ'];
const airline_stocks = ['AAL','DAL','UAL','SKYW','JBLU','ALK','JETS'];//'LUV',
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
