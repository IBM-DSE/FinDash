import React, { Component } from 'react';
import StockPanel from './StockPanel';
import ClientList from './ClientList';
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-md-8">

              <h2>Stocks</h2>
              <StockPanel/>

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

}

export default App;
