import React from 'react';
import qs from 'query-string'

import StockIndices from './StockIndices';
import StockPanel from "./StockPanel";
import News from './News';

const StockMarket = ({ location }) => {
  const query = qs.parse(location.search);
  return (<div className="container">

    <StockIndices/>

    <div className='row'>
      <div className='col-md-9'>
        <StockPanel displayStocks={query['displayStocks[]']} normalized={query.normalized==='true'}/>
      </div>
      <div className='col-md-3'>
        <News stock='RACE' startDate = '2016-11-01' endDate = '2016-11-15'/>
      </div>
    </div>

  </div>);
};

export default StockMarket;