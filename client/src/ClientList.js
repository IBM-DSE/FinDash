import React, { Component } from 'react';

class ClientList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clients: []
    }
  }

  componentDidMount() {
    fetch('/api/users/clients')
      .then(res => res.json())
      .then(clients => this.setState({clients}));
  }

  render() {
    return (
      <div>
        {clientList(this.state.clients)}
      </div>
    );
  }
}

function clientList(arr){
  return arr.map(client =>
    <button key={'client-'+client.id} className="btn btn-lg btn-default btn-client">
      <img src={"/images/"+client.image} className="btn-client-img"/> {client.name}
    </button>
  )
}

export default ClientList;
