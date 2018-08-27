import React, { Component } from 'react';

export default class EthereumTarget extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <h3>Ethereum Address</h3>
        {this.props.ethereum.address}
        <h3>Ethereum Network</h3>
        {this.props.ethereum.network.name}
        <div>{this.props.ethereum.isLoaded && <button onClick={this.props.openSwap}>SWAP!</button>}</div>
      </div>
    );
  }
}
