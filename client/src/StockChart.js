import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';

class StockChart extends Component {
  constructor(props) {
    super(props);
    this.addChartData = this.addChartData.bind(this);
    this.removeChartData = this.removeChartData.bind(this);
    this.state = {
      chartData: {
        labels: [],
        datasets: []
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    let new_stock = arr_diff(nextProps.displayStocks, this.props.displayStocks);
    if(new_stock){
      fetch('/api/stocks/'+new_stock).then(res => res.json())
        .then(stock_data => this.addChartData(stock_data));
    } else {
      let del_stock = arr_diff(this.props.displayStocks, nextProps.displayStocks);
      if(del_stock) { this.removeChartData(del_stock); }
    }
  }

  render() { return (<Line data={this.state.chartData} />); }

  addChartData(stock_data){
    if(stock_data.dates.length > 0 && stock_data.prices.length > 0){
      let chartData = this.state.chartData;
      chartData.labels = stock_data.dates;

      let dataset = JSON.parse(orig_dataset);
      dataset.label = stock_data.stock;
      dataset.data = stock_data.prices;
      chartData.datasets.push(dataset);

      this.setState({ chartData })
    }
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

function arr_diff(arr1, arr2){
  return arr1.filter(x => !arr2.includes(x))[0];
}

export default StockChart;
