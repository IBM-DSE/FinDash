import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.stock_list = this.stock_list.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
  }

  state = {
    users: [],
    stocks: {
      auto_stocks: [],
      airline_stocks: [],
      hotel_stocks: []
    },
    displayStocks: ['F'],
    chartData: {}
  };

  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => this.setState({ users }));
    fetch('/stocks')
      .then(res => res.json())
      .then(stocks => this.setState({ stocks }));
    fetch('/stocks/TSLA')
      .then(res => res.json())
      .then(stock_data => generateChartData(stock_data))
      .then(chartData => this.setState({ chartData }));
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-md-8">

              <h2>Stocks</h2>
              <Line data={this.state.chartData} />

              <div className="row">
                <div className="col-md-4">
                  <h3>Auto</h3>
                  {this.stock_list(this.state.stocks.auto_stocks)}
                </div>
                <div className="col-md-4">
                  <h3>Airlines</h3>
                  {this.stock_list(this.state.stocks.airline_stocks)}
                </div>
                <div className="col-md-4">
                  <h3>Hotels</h3>
                  {this.stock_list(this.state.stocks.hotel_stocks)}
                </div>
              </div>

            </div>
            <div className="col-md-4">
              <h2>Clients</h2>
              {list(this.state.users)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  stock_list(arr) {
    return arr.map(elem =>
      <div key={elem.id}>
        <input type="checkbox" defaultChecked={this.state.displayStocks.includes(elem.id)} onChange={this.toggleCheckbox} id={elem.id}></input> {elem.name}
      </div>
    )
  }

  toggleCheckbox(event) {
    if (event.target.checked) {
      this.state.displayStocks.push(event.target.id)
    } else {
      let index = this.state.displayStocks.indexOf(event.target.id);
      if (index > -1) {
        this.state.displayStocks.splice(index, 1);
      }
    }
    console.log(this.state.displayStocks);
  }
}

function list(arr){
  return arr.map(elem =>
    <div key={elem.id}>{elem.name}</div>
  )
}

function generateChartData(stock_data){
  let chartData = data;
  chartData.labels = stock_data.dates;
  chartData.datasets[0].label = stock_data.stock;
  chartData.datasets[0].data = stock_data.prices;
  return chartData;
}

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
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
    }
  ]
};

export default App;
