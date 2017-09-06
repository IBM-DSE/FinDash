import React, { Component } from 'react';
import StockPanel from './StockPanel';

class ClientPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      client_data: {}
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
            <div className="xl-vals">{client.name}</div>
            <table className="table table-bordered align-right margin-top">
              <tbody>
              {attributeRows(client, basicAttrs)}
              </tbody>
            </table>
          </div>

          <div className="col-md-2"></div>
        </div>

        <br/><br/><br/>

        <div className="row">
          <div className="col-md-1"></div>

          <div className="col-md-10">
            <table className="table">
              <thead>
              <tr className="center-headers">
                {attributeCols(investorDisplayAttrs)}
              </tr>
              </thead>
              <tbody>
              <tr className="big-vals">
                {attributeCols(investorAttrs, client)}
              </tr>
              </tbody>
            </table>
          </div>

          <div className="col-md-2"></div>
        </div>

        <br/><br/>

        <h3>Portfolio</h3>
        <hr className="solid-line"/>
        <StockPanel stocks={stocks} topPanel={true}/>
        <br/><br/><br/><br/><br/><br/><br/><br/>

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
    return stringToCurrency(value);
  else
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

function stringToCurrency(str) {
  let num = parseInt(str).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  return '$ '+num;
}

export default ClientPage;
