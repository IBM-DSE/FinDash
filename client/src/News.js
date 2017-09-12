import React, { Component } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import './daterangepicker.css';
let DateRangePicker = require('react-bootstrap-daterangepicker');
let moment = require('moment');

class News extends Component {

  constructor(props) {
    super(props);
    this.state = {
      news: [],
      startDate: moment(props.startDate || "2017-08-01"),
      endDate: moment(props.endDate || "2017-08-15")
    }
  }

  componentDidMount() {
    fetch('/api/stocks/news/'+this.props.stock)
      .then(res => res.json())
      .then(news => this.setState({news}))
      .catch((error) => { console.error(error); });
  }

  render() {

    let start = this.state.startDate.format('YYYY-MM-DD');
    let end = this.state.endDate.format('YYYY-MM-DD');
    let label = start + ' - ' + end;
    if (start === end) { label = start; }

    return(
      <div className="row">
        <h2>Market News</h2>
        <DateRangePicker startDate={this.state.startDate} endDate={this.state.endDate}>
          <Button className="selected-date-range-btn">
            <div className="pull-left"><Glyphicon glyph="calendar" /> <span>{label}</span> <span className="caret"></span></div>
          </Button>
        </DateRangePicker>
        <br/><br/>
        {newsStories(this.state.news, this.props.full)}
      </div>
    );
  }
}

function newsStories(news_data, full) {
  return news_data.map((story, i) =>
    <div key={'story-' + i} className={full && "col-md-4 col-sm-6"}>
      <div className="panel panel-default">
        <div className="panel-heading">
          <p className="align-left">{(new Date(story['NEWS_DATE'])).toString().slice(4, 16)}</p>
          <h3 className="panel-title">{story['NEWS_TITLE']}</h3>
        </div>
        <div className="panel-body">
          <p className="align-left">{story['NEWS_TEXT'].slice(0, 200) + '...'}</p>
        </div>
        <div className="panel-footer">
          Source: <strong><a href={story['NEWS_URL']} target="_blank">{story['NEWS_SRC']} <Glyphicon glyph='new-window'/></a></strong>
        </div>
      </div>
    </div>
  );
}

export default News;