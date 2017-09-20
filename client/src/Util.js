import React from 'react';
let Spinner = require('react-spinkit');

const Util = {

  stringToCurrency: function(str) {
    let num = parseInt(str, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    return '$ '+num;
  },

  Fetching: (props) => {
    return (<div>
      <h3>Fetching {props.resource}...</h3>
      <div className='full-width'><Spinner name="circle" fadeIn="none" className='center'/></div>
    </div>);
  }

};

export default Util;