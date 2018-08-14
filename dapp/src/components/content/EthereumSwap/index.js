import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { openSwap } from '../../../actions/ethereum';

class EthereumSwap extends Component {
  constructor(props) {
    super(props);
    this.onDalaAmountCaptured = this.onDalaAmountCaptured.bind(this);
    this.onStellarAddressCaptured = this.onStellarAddressCaptured.bind(this);
    this.openSwap = this.openSwap.bind(this);
  }

  onDalaAmountCaptured(event) {
    this.setState({
      dalaAmount: event.target.value
    });
  }

  onStellarAddressCaptured(event) {
    this.setState({
      stellarAddress: event.target.value
    });
  }

  openSwap(event) {
    this.props.openSwap(this.state);
  }

  render() {
    if (this.props.chains.selectedChain === 'ethereum')
      return (
        <div>
          <h3>Current Balances</h3>
          {this.props.ethereum.etherBalance.formatted}
          <br />
          {this.props.ethereum.dalaBalance.formatted}
          {this.props.ethereum.isLoaded && (
            <div>
              <h3>How many $DALA would you like to swap from Ethereum?</h3>
              <input type="text" onChange={this.onDalaAmountCaptured} />
              <h3>What is your Stellar address</h3>
              <input type="text" onChange={this.onStellarAddressCaptured} />
              <br />
              <br />
              <button onClick={this.openSwap}>SWAP!</button>
            </div>
          )}
        </div>
      );
    return <div />;
  }
}

EthereumSwap.contextTypes = {
  drizzle: PropTypes.object
};

const mapStateToProps = state => {
  return {
    ethereum: state.ethereum
  };
};

const actions = {
  openSwap
}

export default drizzleConnect(EthereumSwap, mapStateToProps, actions);
