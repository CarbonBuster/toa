import React, { Component } from 'react';
import { connect } from 'react-redux';
import StellarSdk from 'stellar-sdk';
import { openSwap, loadAccount } from '../../../actions/stellar';
import EthereumTarget from '../ethereum/EthereumTarget';

class StellarSource extends Component {
  constructor(props) {
    super(props);
    this.validateStellarAddress = this.validateStellarAddress.bind(this);
    this.onAmountCaptured = this.onAmountCaptured.bind(this);
    this.onStellarAddressCaptured = this.onStellarAddressCaptured.bind(this);
    this.loadAccount = this.loadAccount.bind(this);
    this.openSwap = this.openSwap.bind(this);
    this.onChainSelected = this.onChainSelected.bind(this);
    this.state = {
      amount: 0,
      stellarAddress: '',
      isValidStellarAddress: false
    };
  }

  openSwap(){
    console.log('openSwap');
  }

  onAmountCaptured(event) {
    this.setState({
      amount: event.target.value
    });
  }

  validateStellarAddress(event) {
    let address = event.target.value;
    this.setState({
      isValidStellarAddress: StellarSdk.StrKey.isValidEd25519PublicKey(address)
    });
  }

  onStellarAddressCaptured(event) {
    this.setState({
      stellarAddress: event.target.value
    });
  }

  loadAccount() {
    this.props.loadAccount(this.state.stellarAddress);
  }

  onChainSelected(event) {
    this.setState({
      targetChain: event.target.value
    });
  }

  render() {
    if (this.props.chains.selectedChain === 'stellar')
      return (
        <div>
          <h3>What is your Stellar address</h3>
          <input type="text" onChange={this.validateStellarAddress} onBlur={this.onStellarAddressCaptured} />
          {!this.state.isValidStellarAddress && <div style={{ color: 'red' }}>Stellar address is invalid</div>}
          <div>{this.state.isValidStellarAddress && <button onClick={this.loadAccount}>Load</button>}</div>
          <h3>Current Balances</h3>
          {this.props.stellar.lumenBalance.formatted}
          <br />
          {this.props.stellar.dalaBalance.formatted}
          {this.props.stellar.isLoaded && (
            <div>
              <h3>How many $DALA would you like to swap from Stellar?</h3>
              <input type="text" onChange={this.onAmountCaptured} />
            </div>
          )}
          {this.state.amount > 0 && (
            <div>
              <h2>What chain would you like to send them to?</h2>
              <select defaultValue="" onChange={this.onChainSelected}>
                <option value="" disabled>
                  Choose Chain
                </option>
                <option value="ethereum">Ethereum</option>
              </select>
            </div>
          )}
          {this.state.targetChain === 'ethereum' && this.state.isValidStellarAddress && <EthereumTarget onTargetAddressCaptured={this.onTargetAddressCaptured} openSwap={this.openSwap} {...this.props} />}
        </div>
      );
    return <div />;
  }
}

const mapStateToProps = state => {
  return {
    stellar: state.stellar,
    ethereum: state.ethereum
  };
};

const actions = {
  openSwap,
  loadAccount
};

export default connect(
  mapStateToProps,
  actions
)(StellarSource);
