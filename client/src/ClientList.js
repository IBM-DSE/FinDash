import React, { Component } from 'react';
import Util from './Util'
let Fetching = Util.Fetching;

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
    fetch('/api/clients')
      .then(res => res.json())
      .then(clients => this.setState({clients: clients, fetching: false}));
  }

  render() {
    if(this.state.fetching)
      return (<Fetching resource='Clients'/>);
    return (<div>{clientList(this.state.clients)}</div>);
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
