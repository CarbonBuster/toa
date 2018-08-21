import React, { Component } from 'react';

export default class StellarSource extends Component {
  render() {
    if (this.props.chains.selectedChain === 'stellar')
      return (
        <div>
          <h2>StellarSwap</h2>
        </div>
      );
    return <div />;
  }
}
