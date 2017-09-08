import React from 'react';
import qs from 'query-string'

import StockIndices from './StockIndices';
import StockPanel from "./StockPanel";
import News from './News';

const StockMarket = ({ location }) => {
  const query = qs.parse(location.search);
  return (<div className="container">

    <StockIndices/>

    <StockPanel displayStocks={query['displayStocks[]']} normalize={query.normalize}/>

    <h2>Market News</h2>
    <News/>

  </div>);
};

export default StockMarket;