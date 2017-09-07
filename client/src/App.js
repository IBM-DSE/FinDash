import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Glyphicon } from 'react-bootstrap';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import ClientList from './ClientList';
import ClientPage from './ClientPage';
import './App.css';
import './react-big-calendar.css';

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

class App extends Component {

  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Home}/>
          <Route path="/about" component={About}/>
          <Route path={`/clients/:clientId`} component={ClientPage}/>
        </div>
      </Router>
    );
  }

}

const Home = () => (
  <div className="container">

    <div className="row">
      <div className="col-sm-4">
        <h2>S&P 500 2,461.53</h2>
        <h3 className="red"><Glyphicon glyph="arrow-down"/> 4.01 (0.16%)</h3>
      </div>
      <div className="col-sm-4">
        <h2>DJIA 21,788.65</h2>
        <h3 className="red"><Glyphicon glyph="arrow-down"/> 18.99 (0.09%)</h3>
      </div>
      <div className="col-sm-4">
        <h2>NASDAQ 6,394.80</h2>
        <h3 className="green"><Glyphicon glyph="arrow-up"/> 2.15 (0.03%)</h3>
      </div>
    </div>

    <div className="row">
      <div className="col-md-8">

        <h2>Agenda</h2>
        <MyCalendar events={events}/>

      </div>
      <div className="col-md-4">

        <h2>Clients</h2>
        <ClientList />

      </div>
    </div>
  </div>
);

const MyCalendar = props => (
  <div>
    <BigCalendar
      events={props.events}
      step={15}
      min={new Date(2017, 8, 26, 9, 0, 0, 0)}
      max={new Date(2017, 8, 26, 17, 0, 0, 0)}
      defaultDate={new Date(2017, 8, 26)}
      defaultView='day'
      components={{
        event: Event
      }}
    />
  </div>
);

function Event({ event }) {
  return (
    <span>
      <strong>{ event.title }</strong>
      <p>{ event.desc }</p>
    </span>
  )
}

const events = [
  {
    'title': 'Prep for Leo Rakes Meeting',
    'start': new Date(2017, 8, 26, 9, 30, 0, 0),
    'end': new Date(2017, 8, 26, 10, 0, 0, 0),
  },
  {
    'title': 'Annual Review with Leo Rakes',
    'start': new Date(2017, 8, 26, 11, 0, 0, 0),
    'end': new Date(2017, 8, 26, 12, 0, 0, 0),
    'desc': 'Zoom URL: https://zoom.us/j/7682934458'
  },
  {
    'title': 'Prep for Frieda Freya Matthews Meeting',
    'start': new Date(2017, 8, 26, 13, 30, 0, 0),
    'end': new Date(2017, 8, 26, 14, 0, 0, 0),
  },
  {
    'title': 'Annual Review with Frieda Freya Matthews',
    'start': new Date(2017, 8, 26, 15, 0, 0, 0),
    'end': new Date(2017, 8, 26, 16, 0, 0, 0),
    'desc': 'Zoom URL: https://zoom.us/j/5983594782'
  },
];

const About = () => (
  <div>
    <h2>About</h2>
    <p>This is what the app is about.</p>
  </div>
);

export default App;
