const express = require('express');
const router = express.Router();
const ibmDB = require('../db/ibm-db');
const sqliteDB = require('../db/sqlite-db');
const jStat = require('jStat').jStat;

const withinTimeFrame = " AND TRADE_DATE >= '2016-09-01' AND TRADE_DATE <= '2017-07-19'";

const queryCurrencyCorrelation = "SELECT * FROM CURRENCY_ANALYSIS WHERE (\"SYMBOL\"='X' AND \"CURRENCY\"='Z'" +
  withinTimeFrame + ") ORDER BY TRADE_DATE",
  posSym = queryCurrencyCorrelation.indexOf('X'),
  posCurr = queryCurrencyCorrelation.indexOf('Z');

/** Query Stock and Currency Mappings **/

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

router.get('/currencies', function(req, res) {
  res.json(currency_mapping);
});

/** Query Stock Prices **/

const queryStocks = "SELECT DISTINCT SYMBOL FROM STOCK_TRADES;";

const checkValidStock = (...stocks) => new Promise(function(resolve, reject) {
  /** Check to see if these are valid stocks **/

  if (stocks.length === 0)
    reject();
  else {
    sqliteDB.queryDatabase(queryStocks, function(result) {
      const allStocks = result.map(x => x['SYMBOL']);
      if (Array.prototype.every.call(stocks, stock => allStocks.includes(stock)))
        resolve();
      else
        reject();
    });
  }
});

const getStockPrices = (stock, query) => new Promise(function(resolve, reject) {
  sqliteDB.queryDatabase(query, {$symbol: stock}, function(data) {
    if (data.length > 0 && data[0]['SYMBOL'] === stock) {
      resolve(data)
    } else {
      reject()
    }
  });
});

const queryStockPrices = "SELECT DISTINCT SYMBOL,TRADE_DATE,CLOSE_PRICE from STOCK_TRADES " +
  "WHERE (\"SYMBOL\"= $symbol " + withinTimeFrame + ") ORDER BY TRADE_DATE";

router.get('/price/:stock', function(req, res) {

  const emptyResp = {stock: req.params.stock, dates: [], prices: []};

  checkValidStock(req.params.stock)
    .then(() => {
      getStockPrices(req.params.stock, queryStockPrices)
        .then(data => res.json({
          stock: req.params.stock,
          dates: data.map(x => x['TRADE_DATE']),
          prices: data.map(x => x['CLOSE_PRICE'])
        }))
        .catch(() => res.json(emptyResp))
    })
    .catch(() => res.json(emptyResp))

});

/** Query Stock / Currency Correlations **/

correlationWindow = 50;

const corrTimeFrame = " AND TRADE_DATE >= '2016-07-07' AND TRADE_DATE <= '2017-07-19'";

const queryCorrPrices = "SELECT DISTINCT SYMBOL,TRADE_DATE,CLOSE_PRICE from STOCK_TRADES " +
  "WHERE (\"SYMBOL\"= $symbol " + corrTimeFrame + ") ORDER BY TRADE_DATE";

router.get('/corr/stocks', function(req, res) {

  const stock1 = req.query.stock1;
  const stock2 = req.query.stock2;

  const resp = {stock1: stock1, stock2: stock2, dates: [], correlations: []};

  checkValidStock(stock1, stock2)
    .then(() => {

      Promise.all([
        getStockPrices(stock1, queryCorrPrices),
        getStockPrices(stock2, queryCorrPrices),
      ]).then(bothData => {

        const prices = bothData.map(data => data.map(x => parseFloat(x['CLOSE_PRICE'])));

        let window1, window2;
        for (let i = correlationWindow; i < prices[0].length; i++) {
          window1 = prices[0].slice(i - correlationWindow, i);
          window2 = prices[1].slice(i - correlationWindow, i);
          resp.correlations.push(jStat.corrcoeff(window1, window2));
        }

        resp.dates = bothData[0].map(x => x['TRADE_DATE']).slice(correlationWindow);
        res.json(resp)
      })
        .catch(() => res.json(resp))
    })
    .catch(() => res.json(resp))
});

router.get('/corr/curr', function(req, res) {

  let stock = req.query.stock;
  let currency = req.query.currency;

  let query = queryCurrencyCorrelation.slice(0, posSym) + stock +
    queryCurrencyCorrelation.slice(posSym + 1, posCurr) +
    currency + queryCurrencyCorrelation.slice(posCurr + 1);

  ibmDB.queryDatabase(query, function(data) {

    if (data.length > 0 && data[0]['SYMBOL'] === req.query.stock) {
      res.json({
        stock: stock, currency: currency,
        dates: data.map(function(x) {
          return x['TRADE_DATE'];
        }),
        correlations: data.map(function(x) {
          return x['CORRELATION'];
        })
      });
    } else
      res.json({stock: stock, currency: currency, dates: [], correlations: []});
  });

});

const newsQueryStart = "SELECT MIN(NEWS_DATE) AS NEWS_DATE, MIN(NEWS_SRC) AS NEWS_SRC, MIN(NEWS_URL) AS NEWS_URL, " +
  "NEWS_TITLE, MIN(NEWS_TEXT) AS NEWS_TEXT\n" +
  "FROM NEWS\n",

  startDateClause = "NEWS_DATE >= '<START_DATE> 00:00:00.000000000'",
  indexOfStartDate = startDateClause.indexOf('<START_DATE>'),
  offsetStartDate = indexOfStartDate + '<START_DATE>'.length,

  endDateClause = "NEWS_DATE <= '<END_DATE> 05:40:00.000000000'",
  indexOfEndDate = endDateClause.indexOf('<END_DATE>'),
  offsetEndDate = indexOfEndDate + '<END_DATE>'.length,

  newsQueryEnd = "GROUP BY NEWS_TITLE\n" +
    "ORDER BY NEWS_DATE DESC, NEWS_TITLE DESC\n" +
    "LIMIT <MAX>",
  indexOfMax = newsQueryEnd.indexOf('<MAX>'),
  offsetMax = indexOfMax + '<MAX>'.length;

router.get('/news/', function(req, res) {

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let maxRows = req.query.max || 6;

  let newsQuery = newsQueryStart;
  if (startDate || endDate) {
    newsQuery += "WHERE (";
    if (startDate)
      newsQuery += startDateClause.slice(0, indexOfStartDate) + startDate + startDateClause.slice(offsetStartDate);
    if (endDate) {
      if (startDate) newsQuery += " AND ";
      newsQuery += endDateClause.slice(0, indexOfEndDate) + endDate + endDateClause.slice(offsetEndDate);
    }
    newsQuery += ")\n";
  }
  newsQuery += newsQueryEnd.slice(0, indexOfMax) + maxRows + newsQueryEnd.slice(offsetMax);

  // const newsQuery = 'SELECT * FROM NEWS LIMIT 6';
  sqliteDB.queryDatabase(newsQuery, stockNews => res.json(stockNews));
});


const auto_stocks = ['F', 'TSLA', 'FCAU', 'TM', 'HMC', 'RACE', 'CARZ'];
const airline_stocks = ['AAL', 'DAL', 'UAL', 'SKYW', 'JBLU', 'ALK', 'JETS'];//'LUV',
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
  // 'EBAY': 'eBay',
  // 'FB': 'Facebook',
  // 'MSFT': 'Microsoft',
  // 'T': 'AT&T'
};

const currency_mapping = {
  'DEXUSEU': 'USD / EUR',
  'DEXCHUS': 'CNY / USD',
  'DEXJPUS': 'JPY / USD'
};

module.exports = router;
