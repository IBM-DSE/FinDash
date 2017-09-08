import React from 'react';
import { Glyphicon } from 'react-bootstrap';

const StockIndices = () => (
  <div className="row">
    <div className="col-sm-4">
      <h2><strong>S&P 500</strong>: 2,461.53</h2>
      <h3 className="red"><Glyphicon glyph="arrow-down"/> 4.01 (0.16%)</h3>
    </div>
    <div className="col-sm-4">
      <h2><strong>DJIA</strong>: 21,788.65</h2>
      <h3 className="red"><Glyphicon glyph="arrow-down"/> 18.99 (0.09%)</h3>
    </div>
    <div className="col-sm-4">
      <h2><strong>NASDAQ</strong>: 6,394.80</h2>
      <h3 className="green"><Glyphicon glyph="arrow-up"/> 2.15 (0.03%)</h3>
    </div>
  </div>
);

export default StockIndices;