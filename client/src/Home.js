import React from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import StockIndices from './StockIndices';
import ClientList from './ClientList';
import News from './News';

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

const Home = () => (
  <div className="container">

    <StockIndices />

    <div className="row">
      <div className="col-md-8">

        <h1>Calendar</h1>
        <MyCalendar events={events}/>

      </div>
      <div className="col-md-4">

        <h1>Clients</h1>
        <ClientList />

      </div>
    </div>

    <News full={true} stock='F'/>

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

export default Home;