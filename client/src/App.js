import React, { Component } from 'react';
import StockChart from './StockChart';
import ClientList from './ClientList';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.stockPanel = this.stockPanel.bind(this);
    this.stockCategories = this.stockCategories.bind(this);
    this.stockList = this.stockList.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.state = {
      stocks: {},
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
              {this.stockPanel()}

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

  stockPanel() {
    return <div className="row">
      {this.stockCategories(this.state.stocks)}
    </div>
  }

  stockCategories(stocks) {
    let categories = Object.keys(stocks);
    let width = (12/categories.length).toString();
    return (categories.map(category =>
      <div className={"col-md-"+width}>
        <div className="stock-list">
          <h3>{category}</h3>
          {this.stockList(stocks[category])}
        </div>
      </div>
    ));
  }

  stockList(arr) {
    return (arr.map(elem =>
      <div key={elem.id}>
        <input type="checkbox" defaultChecked={this.state.displayStocks.includes(elem.id)} onChange={this.toggleCheckbox} id={elem.id}></input> {elem.name}
      </div>
    ));
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
