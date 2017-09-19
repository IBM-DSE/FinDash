import React, { Component } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import './daterangepicker.css';
let DateRangePicker = require('react-bootstrap-daterangepicker');
let moment = require('moment');

class News extends Component {

  constructor(props) {
    super(props);
    this.fetchNews = this.fetchNews.bind(this);
    this.onDateSet = this.onDateSet.bind(this);
    this.state = {
      news: [],
      startDate: props.startDate,
      endDate: props.endDate || '2017-07-19'
    }
  }

  componentDidMount() {
    this.fetchNews();
  }

  render() {

    let label;
    let dateSel = this.props.dateSel;
    if(dateSel){
      let start = this.state.startDate;
      let end = this.state.endDate;
      label = start + ' - ' + end;
      if (start === end) label = start;
    }

    return(
      <div className="row">
        <h2>{dateSel || 'Recent '}Market News</h2>
        {dateSel && <div>
          <DateRangePicker startDate={moment(this.state.startDate)} endDate={moment(this.state.endDate)} onApply={this.onDateSet}>
            <Button className="selected-date-range-btn">
              <div className="pull-left"><Glyphicon glyph="calendar" /> <span>{label}</span> <span className="caret"></span></div>
            </Button>
          </DateRangePicker>
          <br/>
        </div>}
        <br/>
        {newsStories(this.state.news, this.props.full)}
      </div>
    );
  }

  async onDateSet(event, picker) {
    await this.setState({
      startDate: picker.startDate.format('YYYY-MM-DD'),
      endDate:   picker.endDate.format('YYYY-MM-DD')
    });
    this.fetchNews();
  }

  fetchNews() {
    let startDateParam = this.state.startDate ? 'startDate='+this.state.startDate : '';
    let endDateParam = this.state.endDate ? 'endDate='+this.state.endDate : '';
    let maxParam = this.props.max ? 'max='+this.props.max : '';
    let newsApiUrl = '/api/stocks/news?'+startDateParam+'&'+endDateParam+'&'+maxParam;
    fetch(newsApiUrl)
      .then(res => res.json())
      .then(news => this.setState({news}))
      .catch((error) => { console.error(error); });
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