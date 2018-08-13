import React, { Component } from 'react';

export default class EthereumSwap extends Component {
  render() {
    if (this.props.chains.selectedChain === 'ethereum')
      return (
        <div>
          <h2>EthereumSwap</h2>
        </div>
      );
    return <div />;
  }
}
