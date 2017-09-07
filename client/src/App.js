import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Glyphicon } from 'react-bootstrap';
import StockPanel from './StockPanel';
import ClientList from './ClientList';
import ClientPage from './ClientPage';
import './App.css';

class App extends Component {

  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Home}/>
          <Route path="/about" component={About}/>
          <Route path={`/clients/:clientId`} component={ClientPage}/>
        </div>
      </Router>
    );
  }

}

const Home = () => (
  <div className="container">

    <div className="row">
      <div className="col-sm-4">
        <h2>S&P 500 2,461.53</h2>
        <h3 className="red"><Glyphicon glyph="arrow-down"/> 4.01 (0.16%)</h3>
      </div>
      <div className="col-sm-4">
        <h2>DJIA 21,788.65</h2>
        <h3 className="red"><Glyphicon glyph="arrow-down"/> 18.99 (0.09%)</h3>
      </div>
      <div className="col-sm-4">
        <h2>NASDAQ 6,394.80</h2>
        <h3 className="green"><Glyphicon glyph="arrow-up"/> 2.15 (0.03%)</h3>
      </div>
    </div>

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
);

const About = () => (
  <div>
    <h2>About</h2>
    <p>This is what the app is about.</p>
  </div>
);

export default App;
