import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
let moment = require('moment');
require('twix');

class StockChart extends Component {
  constructor(props) {
    super(props);
    this.currentChartStocks = this.currentChartStocks.bind(this);
    this.currentChartCorrs = this.currentChartCorrs.bind(this);
    this.udpateCurrentStocks = this.udpateCurrentStocks.bind(this);
    this.addStockData = this.addStockData.bind(this);
    this.updateDateRange = this.updateDateRange.bind(this);
    this.updateChartData = this.updateChartData.bind(this);
    this.normalizeChartData = this.normalizeChartData.bind(this);
    this.removeChartStocks = this.removeChartStocks.bind(this);
    this.state = {
      stockData: {
        dates: [],
        prices: {},
        correlations: {},
        normalized: props.normalized,
        startInd: 0,
        endInd: 0
      },
      stockChartData: {
        labels: [],
        datasets: []
      },
      corrChartData: {
        labels: [],
        datasets: []
      }
    };
  }

  render() { return (
    <div>
      <Line data={this.state.stockChartData} />
      {this.state.corrChartData.datasets.length>0 && <Line data={this.state.corrChartData} />}
    </div>
  ); }

  componentDidMount() {
    this.udpateCurrentStocks([], this.props.displayStocks);
  }

  componentWillReceiveProps(nextProps) {

    if (this.props.startDate !== nextProps.startDate || this.props.endDate !== nextProps.endDate)
      this.updateDateRange(nextProps.startDate, nextProps.endDate);
    else if(this.props.normalized !== nextProps.normalized)
      this.normalizeChartData(nextProps.normalized);
    else {
      this.udpateCurrentStocks(this.props.displayStocks, nextProps.displayStocks);

      let newStocks = arr_diff(nextProps.correlationStocks, this.currentChartCorrs());
      if (newStocks.length>0){

        let path;
        let stocks = newStocks[0].split('v');
        if(stocks[0].indexOf('DEX')>-1)
          path = '/api/stocks/corr/curr?currency=' + stocks[0] + '&stock=' + stocks[1];
        else if(stocks[1].indexOf('DEX')>-1)
          path = '/api/stocks/corr/curr?stock=' + stocks[0] + '&currency=' + stocks[1];
        else
          path = '/api/stocks/corr/stocks?stock1=' + stocks[0] + '&stock2=' + stocks[1];

        newStocks.forEach(stock => fetch(path).then(res => res.json())
          .then(newStockData => this.addStockData(newStockData, 'correlations')));
      }
    }
  }

  udpateCurrentStocks(currentStocks, nextStocks) {
    let newStocks = arr_diff(nextStocks, currentStocks);
    let delStocks = arr_diff(currentStocks, nextStocks);

    if (newStocks.length>0)
      newStocks.forEach(stock =>
        fetch('/api/stocks/' + stock).then(res => res.json())
          .then(newStockData => this.addStockData(newStockData)));
    else if (delStocks.length>0)
      this.removeChartStocks(delStocks);
  }

  updateDateRange(startDate, endDate, newStock=null) {

    ['stockChartData', 'corrChartData'].forEach((dataType) => {
      let chartData = this.state[dataType];
      let stockData = this.state.stockData;

      if (this.state.stockData.dates.length === 0) {
        let itr = moment.twix(startDate,endDate).iterate("days");
        let range=[];
        while(itr.hasNext()){ range.push(itr.next().format('YYYY-MM-DD')); }
        chartData.labels = range;
      } else {
        let startInd = binSearch(startDate, stockData.dates);
        let endInd = binSearch(endDate, stockData.dates);
        stockData.startInd = startInd; stockData.endInd = endInd;
        this.setState({ stockData });
        chartData.labels = stockData.dates.slice(startInd, endInd+1);
        chartData.datasets.map((dataSet) => {
          dataSet.data = stockData.prices[dataSet.label].slice(startInd, endInd+1);
          return dataSet;
        });
      }
      this.setState({ chartData });
    });

    if(newStock) this.updateChartData(newStock);
  }

  currentChartStocks() {return this.state.stockChartData.datasets.map(dataSet => dataSet.label)}
  currentChartCorrs() {return this.state.corrChartData.datasets.map(dataSet => dataSet.label)}

  // Take the new api stock data and add it to the current state
  addStockData(newStockData, metric='prices') {
    let stockData = this.state.stockData;

    let updateDates = false;
    if (stockData.dates.length === 0) {   // if this is the first stock we are adding
      stockData.dates = newStockData.dates; // update our state with the new stock data dates
      updateDates = true;                   // then update the date range
    }
    else if ( !(stockData.dates[0] === newStockData.dates[0] &&  // check that the stock dates are consistent
                stockData.dates.length === newStockData.dates.length &&
                stockData.dates[stockData.dates.length-1] === newStockData.dates[newStockData.dates.length - 1]))
      console.error('Stock date ranges are inconsistent!');

    // add the new stock prices to our state
    let name = metric==='prices' ? newStockData.stock : correlationLabel(newStockData);
    stockData[metric][name] = newStockData[metric];
    this.setState({ stockData });

    // Update the date range first or directly update the chart data
    if(updateDates) this.updateDateRange(this.props.startDate, this.props.endDate, newStockData);
    else this.updateChartData(newStockData, metric);
  }

  // add the new stock data to the stockChartData
  updateChartData(newStockData, metric='prices'){
    if(newStockData.dates.length > 0) {   // if we have some stock data

      let stockData = this.state.stockData;
      let chartData = metric==='prices' ? this.state.stockChartData : this.state.corrChartData;
      let dataSet = JSON.parse(origDataSet);

      // generate a random color for the new data set
      let color = getRandomColor();
      dataSet.backgroundColor = dataSet.borderColor = dataSet.pointBorderColor =
        dataSet.pointHoverBackgroundColor = dataSet.pointHoverBorderColor = color;

      // create a new chart dataset for the new stock
      if(metric==='prices'){
        let stockName = newStockData.stock;
        dataSet.label = stockName;
        let stockButton = document.getElementById("plot-"+stockName);
        if(stockButton) stockButton.style["background-color"] = color;
      } else
        dataSet.label = correlationLabel(newStockData);

      dataSet.data = stockData[metric][dataSet.label].slice(stockData.startInd, stockData.endInd+1);
      if(stockData.normalized && metric==='prices')
        dataSet = normalizeChartDataset(stockData.normalized, dataSet, stockData);

      // add the dataset to the chartData and update the state
      chartData.datasets.push(dataSet);
      this.setState({ chartData });
    }
  }

  normalizeChartData(normalized) {
    let stockChartData = this.state.stockChartData;
    let stockData = this.state.stockData;
    stockChartData.datasets = this.state.stockChartData.datasets.map(function(dataSet) {
      return normalizeChartDataset(normalized, dataSet, stockData);
    });
    this.setState({ stockChartData });
  }

  async removeChartStocks(delStocks) {

    let stockChartData = this.state.stockChartData;
    let newDataSets = [];

    await stockChartData.datasets.forEach((dataSet) => {
      if (!delStocks.includes(dataSet['label']))
        newDataSets.push(dataSet);
    });

    stockChartData.datasets = newDataSets;
    this.setState({ stockChartData })
  }
}

function normalizeChartDataset(normalize, dataSet, stockData) {

  if(normalize){
    let factor = 100.0/dataSet.data[0];
    dataSet.data = dataSet.data.map(function(val) { return factor*val;});
    return dataSet;
  } else {
    dataSet.data = stockData.prices[dataSet.label].slice(stockData.startInd, stockData.endInd+1);
    return dataSet;
  }
}

const origDataSet = JSON.stringify({
  label: 'Stock Price',
  fill: false,
  lineTension: 0.1,
  backgroundColor: 'rgba(75,192,192,0.4)',
  borderColor: 'rgba(75,192,192,1)',
  borderCapStyle: 'butt',
  borderDash: [],
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBorderColor: 'rgba(75,192,192,1)',
  pointBackgroundColor: '#fff',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10,
  data: [65, 59, 80, 81, 56, 55, 40]
});

function correlationLabel(stockData){
  if(stockData.currency)
    return stockData.stock+'v'+stockData.currency;
  else
    return stockData.stock1+'v'+stockData.stock2;
}

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function arr_diff(arr1, arr2){
  return arr1.filter(x => !arr2.includes(x));
}

// From https://stackoverflow.com/questions/8584902/get-closest-number-out-of-array
function binSearch(num, arr) {
  let mid;
  let lo = 0;
  let hi = arr.length - 1;
  while (hi - lo > 1) {
    mid = Math.floor ((lo + hi) / 2);
    if (arr[mid] < num) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (num - arr[lo] <= arr[hi] - num) {
    return arr[lo];
  }
  return hi;
}

export default StockChart;
