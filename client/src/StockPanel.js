import React, { Component } from 'react';
import { Button, DropdownButton, ToggleButton, ToggleButtonGroup, Glyphicon } from 'react-bootstrap';
import StockChart from './StockChart';
import './daterangepicker.css';
let DateRangePicker = require('react-bootstrap-daterangepicker');
let moment = require('moment');

class StockPanel extends Component {
  constructor(props) {
    super(props);
    this.setDates = this.setDates.bind(this);
    this.stockPanel = this.stockPanel.bind(this);
    this.stockChart = this.stockChart.bind(this);
    this.stockCategories = this.stockCategories.bind(this);
    this.stockList = this.stockList.bind(this);
    this.stockCorrelationList = this.stockCorrelationList.bind(this);
    this.corrStockSelected = this.corrStockSelected.bind(this);
    this.onToggle = this.onToggle.bind(this);
    this.selectAllStocks = this.selectAllStocks.bind(this);
    this.toggleNormalization = this.toggleNormalization.bind(this);
    this.toggleStock = this.toggleStock.bind(this);

    this.state = {
      stocks: props.stocks || {},
      displayStocks: this.props.displayStocks || [],
      normalized: props.normalized || false,
      startDate: moment("2016-09-01"),
      endDate: moment("2017-08-15"),
      corrDropdownExpanded: false,
      stockCorrs: []
    };
  }

  componentDidMount() {
    if(Object.keys(this.state.stocks).length === 0){
      fetch('/api/stocks')
        .then(res => res.json())
        .then(stocks => this.setState({stocks}))
    }
  }

  render() {
    return(
      <div id="stock-panel">

        {this.props.topPanel && this.stockPanel()}

        <h3>Stock Analysis</h3>
        {this.stockChart(this.state.displayStocks)}

        {typeof this.props.topPanel === 'undefined' && this.stockPanel()}

      </div>
    );
  }

  stockChart(displayStocks) {

    let start = this.state.startDate.format('YYYY-MM-DD');
    let end = this.state.endDate.format('YYYY-MM-DD');
    let label = start + ' - ' + end;
    if (start === end) { label = start; }
    let newDisplayStocks = displayStocks.toString().split(','); //copy displayStocks to capture differences

    return (
      <div>
        <div className="checkbox align-left"><label style={{textAlign: 'left'}}>
          <input type="checkbox" onChange={this.toggleNormalization} checked={this.state.normalized}/> Relative Performance</label>
        </div>

        <StockChart displayStocks={newDisplayStocks} startDate={start} endDate={end} normalized={this.state.normalized}/>

        <img id='corrPlot' src={require('./RACEVsHMCv1.JPG')} style={{width: '100%', display: 'none'}}/>

        <DropdownButton id='corr-sel' title='Plot Correlation' style={{marginRight: '80px'}} open={this.state.corrDropdownExpanded} onToggle={this.onToggle}>
          <ToggleButtonGroup type="checkbox">
          {this.stockCorrelationList(this.state.displayStocks)}
          </ToggleButtonGroup>
        </DropdownButton>

        <label>Date Range:</label>{' '}
        <DateRangePicker startDate={this.state.startDate} endDate={this.state.endDate} onApply={this.setDates}>
          <Button className="selected-date-range-btn">
            <div className="pull-left"><Glyphicon glyph="calendar" /> <span>{label}</span> <span className="caret"></span></div>
          </Button>
        </DateRangePicker>
      </div>
    )
  }

  setDates(event, picker) {
    this.setState({
      startDate: picker.startDate,
      endDate:   picker.endDate
    });
  }

  stockPanel() {
    return <div className="row">
      {this.stockCategories(this.state.stocks, this.state.displayStocks)}
    </div>
  }

  stockCategories(stocks, displayStocks) {
    let categories = Object.keys(stocks);
    let width = Math.floor(12/categories.length).toString();
    return (categories.map(category => {
      let selected = category === 'Tech' ? category : null;
      return (<div key={"category-"+category} className={"col-md-"+width}>
        <h3>{category}</h3>
        <ToggleButtonGroup type="checkbox" className="full-width" defaultValue={selected}>
          <ToggleButton id={'all-'+category} value={category} onChange={this.selectAllStocks} block>
            <strong><Glyphicon glyph='check'/> Select All</strong>
          </ToggleButton>
        </ToggleButtonGroup>
        {this.stockList(stocks[category], displayStocks)}
      </div>);
    }));
  }

  stockList(arr, displayStocks) {
    return (arr.map((elem) => {
      let included = displayStocks.includes(elem.id) ? elem.id : null;
      return (
        <ToggleButtonGroup key={elem.id} type="checkbox" className="full-width margin-top-sm" defaultValue={included}>
          <ToggleButton id={'btn-'+elem.id} value={elem.id} onChange={this.toggleStock} block>
            {fullStockName(elem)}
          </ToggleButton>
        </ToggleButtonGroup>
      );
    }));
  }

  stockCorrelationList(arr) {
    return (arr.map(elem =>
      <ToggleButton key={'corr-'+elem} id={'corr-'+elem} value={elem} onChange={this.corrStockSelected} block>{elem}</ToggleButton>
    ));
  }

  async corrStockSelected(event) {
    let add = event.target.checked;
    let stock = event.target.value;
    if(add){
      await this.setState(() => {
        this.state.stockCorrs.push(stock);
      });
      if(this.state.stockCorrs.length === 2){
        document.getElementById("corrPlot").style.display = "inline";
        this.state.stockCorrs.forEach((stock) => {
          let cbox = document.getElementById('corr-'+stock);
          cbox.classList.remove('active');
        });
        this.setState({stockCorrs: [], corrDropdownExpanded: false});
      }
    } else {
      this.setState(() => {
        let index = this.state.stockCorrs.indexOf(stock);
        if (index > -1)
          this.state.stockCorrs.splice(index, 1);
      });
    }
  }

  onToggle(open, event, eventDetails){
    if(eventDetails.source === 'rootClose'){
      this.setState({corrDropdownExpanded: !this.state.corrDropdownExpanded});
    } else if(this.state.stockCorrs.length < 2){
      this.setState({corrDropdownExpanded: true});
    }
  }

  toggleStock(event) {
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

  async selectAllStocks(event) {
    let category = event.target.value;
    let add = event.target.checked;
    let displayStocks = this.state.displayStocks;
    if(add){
      await this.state.stocks[category].forEach((stock) => {
        if(!displayStocks.includes(stock.id)) displayStocks.push(stock.id)
      });
    } else {
      await this.state.stocks[category].forEach((stock) => {
        let index = displayStocks.indexOf(stock.id);
        if (index > -1)
          displayStocks.splice(index, 1);
      });
    }
    this.setState({displayStocks});
  }

  toggleNormalization(event) {
    let normalized = event.target.checked;
    this.setState({normalized});
  }

}

// const fullStockName = (stock) => (stock.name === stock.id ? stock.name : stock.name+" ("+stock.id+")");
const fullStockName = (stock) => stock.id;

export default StockPanel;
