import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
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
