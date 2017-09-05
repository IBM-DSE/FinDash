import React from 'react';

const ClientPage = ({ match }) => (
  <div>
    <h1>Client Page</h1>
    <h3>{match.params.clientId}</h3>
  </div>
);

export default ClientPage;
