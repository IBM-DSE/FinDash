import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
let moment = require('moment');
require('twix');

class StockChart extends Component {
  constructor(props) {
    super(props);
    this.addStockData = this.addStockData.bind(this);
    this.updateDateRange = this.updateDateRange.bind(this);
    this.updateChartData = this.updateChartData.bind(this);
    this.normalizeChartData = this.normalizeChartData.bind(this);
    this.removeChartData = this.removeChartData.bind(this);
    this.state = {
      stockData: {
        dates: [],
        prices: {},
        normalized: props.normalized,
        startInd: 0,
        endInd: 0
      },
      chartData: {
        labels: [],
        datasets: []
      }
    };
  }

  componentDidMount() {
    this.updateDateRange(this.props.startDate, this.props.endDate);
  }

  render() { return ( <Line data={this.state.chartData} /> ); }

  // Component will receive new props, either new display stock or new date ranges
  componentWillReceiveProps(nextProps) {

    let new_stocks = arr_diff(nextProps.displayStocks, this.props.displayStocks);
    let del_stocks = arr_diff(this.props.displayStocks, nextProps.displayStocks);
    if (new_stocks.length>0){
      new_stocks.forEach(stock =>
        fetch('/api/stocks/'+stock).then(res => res.json())
          .then(new_stock_data => this.addStockData(new_stock_data))
      );
    } else if (del_stocks.length>0) {
      this.removeChartData(del_stocks[0]);
    } else if (this.props.startDate !== nextProps.startDate || this.props.endDate !== nextProps.endDate){
      this.updateDateRange(nextProps.startDate, nextProps.endDate);
    }

    if(this.props.normalized != nextProps.normalized){
      this.normalizeChartData(nextProps.normalized);
    }
  }

  updateDateRange(startDate, endDate, new_stock=null) {

    let chartData = this.state.chartData;
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
      chartData.datasets.map(function(dataset) {
        dataset.data = stockData.prices[dataset.label].slice(startInd, endInd+1);
        return dataset;
      });
    }
    this.setState({ chartData });
    if(new_stock) this.updateChartData(new_stock);
  }

  // Take the new api stock data and add it to the current state
  addStockData(new_stock_data) {
    let stockData = this.state.stockData;
    let newStockPrices = new_stock_data.prices;

    let updateDates = false;
    if (stockData.dates.length === 0) { // if this is the first stock we are adding
      stockData.dates = new_stock_data.dates; // update our state with the new stock data dates
      updateDates = true;                     // then update the date range
    }
    else if ( !(stockData.dates[0] === new_stock_data.dates[0] &&  // check that the stock dates are consistent
                stockData.dates.length === new_stock_data.dates.length &&
                stockData.dates[stockData.dates.length-1] === new_stock_data.dates[new_stock_data.dates.length - 1]))
      console.error('Stock date ranges are inconsistent!');

    // add the new stock prices to our state
    stockData.prices[new_stock_data.stock] = newStockPrices;
    this.setState({ stockData });

    // Update the date range first or directly update the chart data
    if(updateDates) this.updateDateRange(this.props.startDate, this.props.endDate, new_stock_data);
    else this.updateChartData(new_stock_data);
  }

  // add the new stock data to the ChartData
  updateChartData(new_stock_data){
    let stockName = new_stock_data.stock;
    let stockPrices = new_stock_data.prices;
    if(stockPrices.length > 0){  // if we have some stock data
      let stockData = this.state.stockData;
      let chartData = this.state.chartData;

      // create a new chart dataset for the new stock
      let dataset = JSON.parse(orig_dataset);
      dataset.label = stockName;

      let color = getRandomColor();
      dataset.backgroundColor = dataset.borderColor = dataset.pointBorderColor =
        dataset.pointHoverBackgroundColor = dataset.pointHoverBorderColor = color;
      document.getElementById("btn-"+stockName).style["background-color"] = color;

      dataset.data = stockData.prices[dataset.label].slice(stockData.startInd, stockData.endInd+1);
      if(stockData.normalized){ dataset = normalizeChartDataset(stockData.normalized, dataset, stockData); }

      // add the dataset to the chartData and update the state
      chartData.datasets.push(dataset);
      this.setState({ chartData });
    }
  }

  normalizeChartData(normalized) {
    let chartData = this.state.chartData;
    let stockData = this.state.stockData;
    chartData.datasets = this.state.chartData.datasets.map(function(dataset) {
      return normalizeChartDataset(normalized, dataset, stockData);
    });
    this.setState({ chartData });
  }

  removeChartData(stock) {
    let chartData = this.state.chartData;
    let newDatasets = [];
    for(let i in chartData.datasets){
      if (chartData.datasets[i]['label'] !== stock){
        newDatasets.push(chartData.datasets[i]);
      }
    }
    chartData.datasets = newDatasets;
    this.setState({ chartData })
  }
}

function normalizeChartDataset(normalize, dataset, stockData) {

  if(normalize){
    let factor = 100.0/dataset.data[0];
    dataset.data = dataset.data.map(function(val) { return factor*val;});
    return dataset;
  } else {
    dataset.data = stockData.prices[dataset.label].slice(stockData.startInd, stockData.endInd+1);
    return dataset;
  }
}

const orig_dataset = JSON.stringify({
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
