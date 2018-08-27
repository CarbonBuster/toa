import React, { Component } from 'react';
import StellarSdk from 'stellar-sdk';

export default class StellarTarget extends Component {
  constructor(props) {
    super(props);
    this.validateStellarAddress = this.validateStellarAddress.bind(this);
    this.state = {
      isValidStellarAddress: false
    };
  }

  validateStellarAddress(event) {
    let address = event.target.value;
    this.setState({
      isValidStellarAddress: StellarSdk.StrKey.isValidEd25519PublicKey(address)
    });
  }

  render() {
    return (
      <div>
        <h3>What is your Stellar address</h3>
        <input type="text" onChange={this.validateStellarAddress} onBlur={this.props.onTargetAddressCaptured} />
        {!this.state.isValidStellarAddress && <div style={{ color: 'red' }}>Stellar address is invalid</div>}
        <div>{this.state.isValidStellarAddress && <button onClick={this.props.openSwap}>SWAP!</button>}</div>
      </div>
    );
  }
}
