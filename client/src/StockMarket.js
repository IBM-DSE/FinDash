import React from 'react';

import StockIndices from './StockIndices';
import StockPanel from "./StockPanel";
import News from './News';

const StockMarket = () => (
  <div className="container">

    <StockIndices />

    <StockPanel/>

    <h2>Market News</h2>
    <News />

  </div>
);

export default StockMarket;