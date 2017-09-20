import React, { Component } from 'react';
import Util from './Util'
let Spinner = require('react-spinkit');

class ClientList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clients: [],
      fetching: false
    }
  }

  componentDidMount() {
    this.setState({fetching: true});
    fetch('/api/users/clients')
      .then(res => res.json())
      .then(clients => this.setState({clients: clients, fetching: false}));
  }

  render() {
    if(this.state.fetching)
      return (<div>
        <h3>Fetching Clients...</h3>
        <div className='full-width'><Spinner name="circle" fadeIn="none" className='center'/></div>
      </div>);
    return (
      <div>
        {clientList(this.state.clients)}
      </div>
    );
  }
}

function clientList(arr){
  return arr.map(client =>
    <a key={'client-'+client.id} href={"/clients/"+client.id} className="btn btn-lg btn-default btn-client">
      <img src={"/images/"+client.image} alt={'client-'+client.id} className="btn-client-img"/>
      <div>
        <strong>{client.name}</strong>
        <p className="acc-bal">Account Balance: {Util.stringToCurrency(client.acc_bal)}</p>
      </div>
    </a>
  )
}

export default ClientList;
