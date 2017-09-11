import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import StockPanel from './StockPanel';
import Util from './Util'

class ClientPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      client_data: {},
    }
  }

  componentDidMount() {
    fetch('/api/users/clients/'+this.props.match.params.clientId)
      .then(res => res.json())
      .then(client_data => this.setState({client_data}))
      .catch((error) => { console.error(error); });
  }

  render() {
    let client = this.state.client_data;
    let queryString = stockTickers.reduce((str, stock, i) => (str += (i===0?'?':'&')+'displayStocks[]='+stock), '');
    queryString += '&normalized=true';
    return (
      <div className="container">

        <h2>Client Profile</h2>
        <br/>

        <div className="row">
          <div className="col-md-2"></div>

          <div className="col-md-3">
            <img src={"/images/"+client.image} alt={'client-'+client.id} className="big-img" />
          </div>

          <div className="col-md-5">
            <div className="xx-large">{client.name}</div>
            <table className="table table-bordered align-right margin-top larger">
              <tbody>
              {attributeRows(client, basicAttrs)}
              </tbody>
            </table>
          </div>

          <div className="col-md-2"></div>
        </div>

        <br/><br/>

        <div className="row">
          <div className="col-md-1"></div>

          <div className="col-md-10">
            <table className="table larger">
              <thead>
              <tr className="center-headers">
                {attributeCols(investorDisplayAttrs)}
              </tr>
              </thead>
              <tbody>
              <tr className="">
                {attributeCols(investorAttrs, client)}
              </tr>
              </tbody>
            </table>
          </div>

          <div className="col-md-1"></div>
        </div>

        <br/><br/>
        <h3>
          <strong>Last Meeting with {this.state.client_data.name}:</strong> October 24th, 2016
        </h3>
        <br/><br/><br/>

        <div className="row">
          <div className="col-md-2"></div>

          <div className="col-md-8">

            <h3>Predicted Industry Affinity</h3>
            <table className="table x-large">
              <thead>
              <tr className="center-headers">
                {attributeCols(categories)}
              </tr>
              </thead>
              <tbody>
              <tr>
                {attributeCols(categories, predictions)}
              </tr>
              </tbody>
            </table>
          </div>

          <div className="col-md-2"></div>
        </div>

        <br/>

        <h3>Portfolio</h3>
        <hr className="solid-line"/>
        <StockPanel stocks={stocks} topPanel={true} displayStocks={stockTickers} normalized={true}/>

        <br/>
        <Button href={"/market"+queryString}><h4>Compare Against the Market ></h4></Button>
        <br/><br/>

      </div>
    );
  }

}

function attributeRows(hash, displayAttrs) {
  return displayAttrs.map(key =>
    <tr key={key}>
      <th>{key}</th>
      <td>{formatAttrs(key, hash[key])}</td>
    </tr>
  );
}

function attributeCols(displayAttrs, hash=null) {
  if(hash){
    return displayAttrs.map(key =>
      <td key={key}>{formatAttrs(key, hash[key])}</td>
    );
  } else {
    return displayAttrs.map(key =>
      <th key={key}>{key}</th>
    );
  }
}

const basicAttrs = [
  'Gender',
  'Age',
  'Income',
  'Education',
  'Profession',
];

function formatAttrs(key, value){
  if(key === 'Income' || key === 'AccountBalance')
    return Util.stringToCurrency(value);
  else if(categories.includes(key)){
    if(value >= '90%')
      return(<div>
        {value} <span className="glyphicon glyphicon-arrow-up" style={{color: 'green'}}></span>
      </div>);
    else
      return(<div>
        {value} <span className="glyphicon glyphicon-arrow-down" style={{color: 'red'}}></span>
      </div>);
  } else
    return value;
}

const investorAttrs = [
  'AccountBalance',
  'NumTradesPerYr',
  'AccountType',
  'TradingStrategy',
  'TradingStyle',
];

const investorDisplayAttrs = [
  'Account Balance',
  'Trades per Year',
  'Account Type',
  'Trading Strategy',
  'Trading Style',
];

const stocks = {
  "Auto":[
    {"id":"RACE","name":"Ferrari N.V."}
  ],"Tech":[
    {"id":"AMZN","name":"Amazon.com, Inc."},
    {"id":"GOOGL","name":"Alphabet Inc Class A"},
    {"id":"AAPL","name":"Apple Inc."}
  ]
};

const stockTickers = ['RACE', 'AMZN', 'GOOGL', 'AAPL'];

const predictions = {
  'Auto': '94%',
  'Tech': '84%',
  'Airlines': '48%',
  'Hotels': '31%'
};

const categories = Object.keys(predictions);

export default ClientPage;
