import React, { Component } from 'react';
import StockPanel from './StockPanel';
import Util from './Util'

class ClientPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      client_data: {},
      news: []
    }
  }

  componentDidMount() {
    fetch('/api/users/clients/'+this.props.match.params.clientId)
      .then(res => res.json())
      .then(client_data => this.setState({client_data}))
      .catch((error) => { console.error(error); });
    fetch('/api/stocks/news/F')
      .then(res => res.json())
      .then(news => this.setState({news}))
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
            <div className="xx-large">{client.name}</div>
            <table className="table table-bordered align-right margin-top larger">
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

        <br/><br/>

        <h3>Portfolio</h3>
        <hr className="solid-line"/>
        <div className="col-md-8">
          <StockPanel stocks={stocks} topPanel={true}/>
        </div>
        <div className="col-md-4">
          <h3>News</h3>
          {newsStories(this.state.news)}
        </div>
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

function newsStories(news_data) {
  return news_data.map((story, i) =>
    <div key={'story-'+i} className="panel panel-default">
      <div className="panel-heading">
        <p className="align-left">{(new Date(story['NEWS_DATE'])).toString().slice(4, 16)}</p>
        <h3 className="panel-title">{story['NEWS_TITLE']}</h3>
      </div>
      <div className="panel-body">
        <p className="align-left">{story['NEWS_TEXT'].slice(0,200)+'...'}</p>
      </div>
      <div className="panel-footer"><a href={story['NEWS_URL']} target="_blank">{story['NEWS_URL']}</a></div>
    </div>
  );
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
    if(value === '95%')
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

const predictions = {
  'Auto': '95%',
  'Tech': '84%',
  'Airlines': '48%',
  'Hotels': '31%'
};

const categories = Object.keys(predictions);

export default ClientPage;
