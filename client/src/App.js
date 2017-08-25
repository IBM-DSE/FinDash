import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {users: [], stocks: {
    auto_stocks: [],
    airline_stocks: [],
    hotel_stocks: []
  }};

  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => this.setState({ users }));
    fetch('/stocks')
      .then(res => res.json())
      .then(stocks => this.setState({ stocks }));
  }

  render() {
    return (
      <div className="App">
        <div className="row">
          <div className="col-md-6">
            <h2>Stocks</h2>
            <div className="row">
              <div className="col-md-4">
                <h3>Auto</h3>
                {list(this.state.stocks.auto_stocks)}
              </div>
              <div className="col-md-4">
                <h3>Airlines</h3>
                {list(this.state.stocks.airline_stocks)}
              </div>
              <div className="col-md-4">
                <h3>Hotels</h3>
                {list(this.state.stocks.hotel_stocks)}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <h2>Clients</h2>
            {list(this.state.users)}
          </div>
        </div>
      </div>
    );
  }
}

function list(arr){
  return arr.map(elem =>
    <div key={elem.id}>{elem.name}</div>
  )
}

export default App;
