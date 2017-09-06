import React, { Component } from 'react';
import { Button, ToggleButton, ToggleButtonGroup, Glyphicon } from 'react-bootstrap';
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
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.state = {
      stocks: props.stocks || {},
      displayStocks: [],
      startDate: moment("2017-01-01"),
      endDate: moment("2017-08-15")
    };
  }

  componentDidMount() {
    if(Object.keys(this.state.stocks).length === 0){
      fetch('/api/stocks')
        .then(res => res.json())
        .then(stocks => this.setState({ stocks }));
    }
  }

  render() {
    return(
      <div id="stock-panel">

        {this.props.topPanel && this.stockPanel()}

        {this.stockChart()}

        {this.props.topPanel==null && this.stockPanel()}

      </div>
    );
  }

  stockChart() {

    let start = this.state.startDate.format('YYYY-MM-DD');
    let end = this.state.endDate.format('YYYY-MM-DD');
    let label = start + ' - ' + end;
    if (start === end) { label = start; }

    return (
      <div>
        <StockChart displayStocks={this.state.displayStocks} startDate={start} endDate={end} />

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
      {this.stockCategories(this.state.stocks)}
    </div>
  }

  stockCategories(stocks) {
    let categories = Object.keys(stocks);
    let width = (12/categories.length).toString();
    return (categories.map(category =>
      <div key={"category-"+category} className={"col-md-"+width}>
        <h3>{category}</h3>
        <ToggleButtonGroup type="checkbox" className="full-width">
          {this.stockList(stocks[category])}
        </ToggleButtonGroup>
      </div>
    ));
  }

  stockList(arr) {
    return (arr.map(elem =>
      <ToggleButton key={elem.id} value={elem.id} className="btn-stock" onChange={this.toggleCheckbox} block>
        {elem.name === elem.id ? elem.name : elem.name+" ("+elem.id+")"}
      </ToggleButton>
    ));
  }

  toggleCheckbox(event) {
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

}

export default StockPanel;
