import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import StockPanel from './StockPanel';
import Util from './Util'
let Fetching = Util.Fetching;

class ClientPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      client_data: {},
      stocks: {},
      fetching: false
    }
  }

  componentDidMount() {
    this.setState({fetching: true});
    fetch('/api/clients/'+this.props.match.params.clientId)
      .then(res => res.json())
      .then(client_data => this.setState({client_data: client_data, fetching: false}))
      .catch((error) => { console.error(error); });
    if(Object.keys(this.state.stocks).length === 0)
      fetch('/api/stocks').then(res => res.json()).then(stocks => {
        stocks.categories = clientStocks;
        this.setState({stocks})
      });
  }

  render() {
    if(this.state.fetching)
      return (
        <div className="container">
          <h2>Client Profile</h2><br/>
          <Fetching resource='Client Data'/>
        </div>);
    let client = this.state.client_data;
    let queryString = stockTickers.reduce((str, stock, i) => (str += (i===0?'?':'&')+'displayStocks[]='+stock), '');
    queryString += '&normalized=true';
    return (
      <div className="container">

        <h2>Client Profile</h2>
        <br/>

        <div className="row">
          <div className="col-md-2" />

          <div className="col-md-3">
            {client.image && <img src={"/images/"+client.image} alt={'client-'+client.id} className="big-img" />}
          </div>

          <div className="col-md-5">
            <div className="xx-large">{client.name}</div>
            <table className="table table-bordered align-right margin-top larger">
              <tbody>
              {attributeRows(client, basicAttrs)}
              </tbody>
            </table>
          </div>

          <div className="col-md-2" />
        </div>

        <br/><br/>

        <div className="row">
          <div className="col-md-1" />

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

          <div className="col-md-1" />
        </div>

        <br/><br/>
        <h3>
          <strong>Last Meeting with {this.state.client_data.name}:</strong> October 24th, 2016
        </h3>
        <br/><br/><br/>

        <div className="row">
          <div className="col-md-2" />

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

          <div className="col-md-2" />
        </div>

        <br/>

        <h3>Portfolio</h3>
        <hr className="solid-line"/>
        {this.state.stocks.categories && <StockPanel stocks={this.state.stocks} topPanel={true} displayStocks={stockTickers} normalized={true}/>}

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
      <th>{key === 'Income' ? 'Annual Income' : key}</th>
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
  if(value){
    if(key === 'Income' || key === 'AccountBalance')
      return Util.stringToCurrency(value);
    else if(categories.includes(key)){
      if(value >= '90%')
        return(<div>
          {value} <span className="glyphicon glyphicon-arrow-up" style={{color: 'green'}} />
        </div>);
      else
        return(<div>
          {value} <span className="glyphicon glyphicon-arrow-down" style={{color: 'red'}} />
        </div>);
    } else
      return value;
  }
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

const clientStocks = {
  "Auto":["RACE"],
  "Tech":["AMZN","GOOGL","AAPL"]
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
