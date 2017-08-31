import React, { Component } from 'react';
import StockChart from './StockChart';
import ClientList from './ClientList';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.stock_list = this.stock_list.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.state = {
      stocks: {
        auto_stocks: [],
        airline_stocks: [],
        hotel_stocks: []
      },
      displayStocks: []
    };
  }

  componentDidMount() {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(stocks => this.setState({ stocks }));
  }

  render() {
    const displayStocks = this.state.displayStocks;
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-md-8">

              <h2>Stocks</h2>
              <StockChart displayStocks={displayStocks} />

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
              <ClientList />
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
    let stock = event.target.id;
    let add = event.target.checked;
    this.setState(function(prevState) {
      let displayStocks = prevState.displayStocks.slice(0);
      if (add) {
        displayStocks.push(stock);
      } else {
        let index = displayStocks.indexOf(stock);
        if (index > -1) {
          displayStocks.splice(index, 1);
        }
      }
      return {displayStocks: displayStocks};
    });
  }

}

export default App;
