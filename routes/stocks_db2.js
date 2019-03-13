let express = require('express');
let router = express.Router();
const jStat = require('jStat').jStat;
let ibmDB = require('../db/ibm-db');


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

/** Query Stock / Currency Correlations **/

correlationWindow = 50;
const correlationStartDate = '2016-07-07';

router.get('/corr/stocks', function(req, res) {

  const stock1 = req.query.stock1;
  const stock2 = req.query.stock2;

  const resp = {stock1: stock1, stock2: stock2, dates: [], correlations: []};

  Promise.all([
    getStockPrices(stock1, correlationStartDate, primaryEndDate),
    getStockPrices(stock2, correlationStartDate, primaryEndDate),
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
});

const getCurrencyPrices = ($currency, $startDate, $endDate) => new Promise(function(resolve, reject) {

  let query = `SELECT * from CURRENCY_RATES WHERE (\"CURRENCY\"='${$currency}' 
  AND TRADE_DATE >= '${$startDate}' AND TRADE_DATE <= '${$endDate}') ORDER BY TRADE_DATE`;

  ibmDB.queryDatabase(query, (data) => {
    if (data.length > 0 && data[0]['CURRENCY'] === $currency) {
      resolve(data)
    } else {
      reject()
    }
  });
});

router.get('/corr/curr', function(req, res) {

  let stock = req.query.stock;
  let currency = req.query.currency;

  const resp = {stock: stock, currency: currency, dates: [], correlations: []};

  Promise.all([
    getStockPrices(stock, correlationStartDate, primaryEndDate),
    getCurrencyPrices(currency, correlationStartDate, primaryEndDate),
  ]).then(bothData => {

    const stockPrices = bothData[0].map(x => parseFloat(x['CLOSE_PRICE']));
    const currencyPrices = bothData[1].map(x => parseFloat(x['VALUE']));

    let window1, window2;
    for (let i = correlationWindow; i < stockPrices.length; i++) {
      window1 = stockPrices.slice(i - correlationWindow, i);
      window2 = currencyPrices.slice(i - correlationWindow, i);
      resp.correlations.push(jStat.corrcoeff(window1, window2));
    }

    resp.dates = bothData[0].map(x => x['TRADE_DATE']).slice(correlationWindow);
    res.json(resp)
  })
    .catch(() => res.json(resp))

});

const primaryStartDate = '2016-09-01';
const primaryEndDate = '2017-07-19';

function verifyData(data, $symbol, $startDate, $endDate) {
  return data.length > 0
    && data[0]['SYMBOL'] === $symbol
    && data[0]['TRADE_DATE'] >= $startDate
    && data[data.length-1]['TRADE_DATE'] <= $endDate
}

const getStockPrices = ($symbol, $startDate, $endDate) => new Promise((resolve, reject) => {

  let query = `SELECT DISTINCT SYMBOL,TRADE_DATE,CLOSE_PRICE from STOCK_TRADES WHERE (\"SYMBOL\"='${$symbol}' 
  AND TRADE_DATE >= '${$startDate}' AND TRADE_DATE <= '${$endDate}') ORDER BY TRADE_DATE`;

  ibmDB.queryDatabase(query, (data) => {
    if (verifyData(data, $symbol, $startDate, $endDate)) {
      resolve(data)
    } else {
      reject()
    }
  });
});

router.get('/price/:stock', function(req, res) {

  getStockPrices(req.params.stock, primaryStartDate, primaryEndDate)
    .then(data => res.json({
      stock: req.params.stock,
      dates: data.map(x => x['TRADE_DATE']),
      prices: data.map(x => x['CLOSE_PRICE'])
    }))
    .catch(() => res.json({ stock: req.params.stock, dates: [], prices: [] }));

});

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
