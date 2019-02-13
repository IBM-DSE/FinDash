import React from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import StockIndices from './StockIndices';
import ClientList from './ClientList';
import News from './News';

const localizer = BigCalendar.momentLocalizer(moment);

const Home = () => (
  <div>
    <h1 style={{textAlign: 'left', marginLeft: '40px'}} >Welcome, Susan!</h1>

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

      <News full={true}/>

    </div>
  </div>
);

const MyCalendar = props => (
  <div>
    <BigCalendar
      localizer={localizer}
      events={props.events}
      step={15}
      min={new Date(2017, 8, 19, 9, 0, 0, 0)}
      max={new Date(2017, 8, 19, 17, 0, 0, 0)}
      defaultDate={new Date(2017, 6, 19)}
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
    'start': new Date(2017, 6, 19, 9, 30, 0, 0),
    'end': new Date(2017, 6, 19, 10, 0, 0, 0),
  },
  {
    'title': 'Annual Review with Leo Rakes',
    'start': new Date(2017, 6, 19, 11, 0, 0, 0),
    'end': new Date(2017, 6, 19, 12, 0, 0, 0),
    'desc': 'Zoom URL: https://zoom.us/j/7682934458'
  },
  {
    'title': 'Prep for Frieda Freya Matthews Meeting',
    'start': new Date(2017, 6, 19, 13, 30, 0, 0),
    'end': new Date(2017, 6, 19, 14, 0, 0, 0),
  },
  {
    'title': 'Annual Review with Frieda Freya Matthews',
    'start': new Date(2017, 6, 19, 15, 0, 0, 0),
    'end': new Date(2017, 6, 19, 16, 0, 0, 0),
    'desc': 'Zoom URL: https://zoom.us/j/5983594782'
  },
];

export default Home;