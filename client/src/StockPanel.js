import React, { Component } from 'react';
import { Glyphicon, ControlLabel, Checkbox, Button, DropdownButton, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import StockChart from './StockChart';
import './daterangepicker.css';
let DateRangePicker = require('react-bootstrap-daterangepicker');
let moment = require('moment');

class StockPanel extends Component {
  constructor(props) {
    super(props);
    this.stockSelection = this.stockSelection.bind(this);
    this.stockCategories = this.stockCategories.bind(this);
    this.stockList = this.stockList.bind(this);
    this.stockCorrelationList = this.stockCorrelationList.bind(this);
    this.currencyCorrelationList = this.currencyCorrelationList.bind(this);
    this.onDateSet = this.onDateSet.bind(this);
    this.onToggleStock = this.onToggleStock.bind(this);
    this.onSelectAllStocks = this.onSelectAllStocks.bind(this);
    this.onCorrDropdownToggle = this.onCorrDropdownToggle.bind(this);
    this.onCorrStockSelect = this.onCorrStockSelect.bind(this);
    this.onToggleNormalization = this.onToggleNormalization.bind(this);

    this.state = {
      stocks: props.stocks || {},
      currencies: {},
      displayStocks: this.props.displayStocks || [],
      normalized: props.normalized || false,
      startDate: moment("2016-09-01"),
      endDate: moment("2017-08-15"),
      corrDropdownExpanded: false,
      corrSelections: [],
      correlations: []
    };
  }

  componentDidMount() {
    if(Object.keys(this.state.stocks).length === 0)
      fetch('/api/stocks').then(res => res.json()).then(stocks => this.setState({stocks}));

    fetch('/api/stocks/currencies')
      .then(res => res.json()).then(currencies => this.setState({currencies}));
  }

  render() {

    // Initialize Date Variables
    let start = this.state.startDate.format('YYYY-MM-DD');
    let end = this.state.endDate.format('YYYY-MM-DD');
    let label = start + ' - ' + end;
    if (start === end) { label = start; }

    let newDisplayStocks = JSON.parse(JSON.stringify(this.state.displayStocks));

    console.log(this.state.displayStocks);
    return(
      <div id="stock-panel">

        {this.props.topPanel && this.stockSelection()}

        <h3>Stock Analysis</h3>

        <div className="checkbox align-left">
          <Checkbox onChange={this.onToggleNormalization} checked={this.state.normalized}>Relative Performance</Checkbox>
        </div>

        <StockChart displayStocks={newDisplayStocks} correlationStocks={this.state.correlations}
                    startDate={start} endDate={end} normalized={this.state.normalized}/>

        <DropdownButton title='Plot Correlation' id='corr-sel' style={{marginRight: '100px'}}
                        open={this.state.corrDropdownExpanded} onToggle={this.onCorrDropdownToggle}>
          <div style={{display: 'table'}}>
            <ToggleButtonGroup type="checkbox" style={{display: 'table-cell'}}>
              {this.stockCorrelationList(this.state.displayStocks)}
            </ToggleButtonGroup>
            <ToggleButtonGroup type="checkbox" style={{display: 'table-cell'}}>
              {this.currencyCorrelationList(this.state.currencies)}
            </ToggleButtonGroup>
          </div>
        </DropdownButton>

        <ControlLabel>Date Range:</ControlLabel>{' '}
        <DateRangePicker startDate={this.state.startDate} endDate={this.state.endDate} onApply={this.onDateSet}>
          <Button className="selected-date-range-btn">
            <div><Glyphicon glyph="calendar" /> <span>{label}</span> <span className="caret"/></div>
          </Button>
        </DateRangePicker>

        {typeof this.props.topPanel === 'undefined' && this.stockSelection()}

      </div>
    );
  }

  stockSelection() {
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
          <ToggleButton id={'all-'+category} value={category} onChange={this.onSelectAllStocks} block>
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
          <ToggleButton id={'plot-'+elem.id} value={elem.id} onChange={this.onToggleStock} block>
            {fullStockName(elem)}
          </ToggleButton>
        </ToggleButtonGroup>
      );
    }));
  }

  stockCorrelationList(arr) {
    return (arr.map(elem =>
      <ToggleButton key={'corr-'+elem} id={'corr-'+elem} value={elem} onChange={this.onCorrStockSelect} block>{elem}</ToggleButton>
    ));
  }

  currencyCorrelationList(hash) {
    return (Object.keys(hash).map(sym =>
      <ToggleButton key={'corr-'+sym} id={'corr-'+sym} value={sym} onChange={this.onCorrStockSelect} block>{hash[sym]}</ToggleButton>
    ));
  }

  onDateSet(event, picker) {
    this.setState({
      startDate: picker.startDate,
      endDate:   picker.endDate
    });
  }

  onToggleStock(event) {
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

  async onSelectAllStocks(event) {
    let category = event.target.value;
    let add = event.target.checked;
    let displayStocks = this.state.displayStocks;
    if(add){
      await this.state.stocks[category].forEach((stock) => {
        if(!displayStocks.includes(stock.id)){
          displayStocks.push(stock.id);
          selectStock('plot-', stock.id);
        }
      });
    } else {
      await this.state.stocks[category].forEach((stock) => {
        let index = displayStocks.indexOf(stock.id);
        if (index > -1){
          displayStocks.splice(index, 1);
          deselectStock('plot-', stock.id);
        }
      });
    }
    this.setState({displayStocks});
  }

  onCorrDropdownToggle(open, event, eventDetails){
    if(eventDetails.source === 'rootClose')
      this.setState({corrDropdownExpanded: !this.state.corrDropdownExpanded});
    else if(this.state.corrSelections.length < 2)
      this.setState({corrDropdownExpanded: true});
  }

  async onCorrStockSelect(event) {
    let add = event.target.checked;
    let stock = event.target.value;
    if(add) {
      await this.setState(() => {
        this.state.corrSelections.push(stock);
      });
      if(this.state.corrSelections.length === 2){
        // document.getElementById("corrPlot").style.display = "inline";

        let label = this.state.corrSelections[0]+'v'+this.state.corrSelections[1];
        this.state.correlations.push(label);

        this.state.corrSelections.forEach((stock) => deselectStock('corr-', stock));
        this.setState({corrSelections: [], corrDropdownExpanded: false});
      }
    } else {
      this.setState(() => {
        let index = this.state.corrSelections.indexOf(stock);
        if (index > -1)
          this.state.corrSelections.splice(index, 1);
      });
    }
  }

  onToggleNormalization(event) {
    let normalized = event.target.checked;
    this.setState({normalized});
  }

}

function deselectStock(prefix, stock) {
  let stockButton = document.getElementById(prefix+stock);
  stockButton.classList.remove('active');
}

function selectStock(prefix, stock) {
  let stockButton = document.getElementById(prefix+stock);
  stockButton.classList.add('active');
}

const fullStockName = (stock) => (stock.name === stock.id ? stock.name : stock.name+" ("+stock.id+")");

export default StockPanel;
