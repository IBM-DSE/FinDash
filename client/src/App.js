import React, { Component } from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
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
      <div key={"category-"+category} className={"col-md-"+width}>
        <h3>{category}</h3>
        <ToggleButtonGroup type="checkbox" className="full-width">
          {this.stockList(stocks[category])}
        </ToggleButtonGroup>
      </div>
    ));
  }

  stockList(arr) {
    return (arr.map(elem =>
      <ToggleButton key={elem.id} value={elem.id} className="btn-stock" onChange={this.toggleCheckbox} block>{elem.name}</ToggleButton>
    ));
  }

  toggleCheckbox(event) {
    let stock = event.target.value;
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
