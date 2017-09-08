import React, { Component } from 'react';

class News extends Component {

  constructor(props) {
    super(props);
    this.state = {
      news: []
    }
  }

  componentDidMount() {
    fetch('/api/stocks/news/F')
      .then(res => res.json())
      .then(news => this.setState({news}))
      .catch((error) => { console.error(error); });
  }

  render() {
    return(<div className="row">{newsStories(this.state.news)}</div>);
  }
}

function newsStories(news_data) {
  return news_data.map((story, i) =>
    <div key={'story-' + i} className="col-md-4 col-sm-6">
      <div className="panel panel-default">
      <div className="panel-heading">
        <p className="align-left">{(new Date(story['NEWS_DATE'])).toString().slice(4, 16)}</p>
        <h3 className="panel-title">{story['NEWS_TITLE']}</h3>
      </div>
      <div className="panel-body">
        <p className="align-left">{story['NEWS_TEXT'].slice(0, 200) + '...'}</p>
      </div>
      <div className="panel-footer"><a href={story['NEWS_URL']} target="_blank">{story['NEWS_URL']}</a></div>
      </div>
    </div>
  );
}

export default News;