import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { openSwap } from '../../../actions/ethereum';
import StellarTarget from '../stellar/StellarTarget';

class EthereumSource extends Component {
  constructor(props) {
    super(props);
    this.onAmountCaptured = this.onAmountCaptured.bind(this);
    this.onTargetAddressCaptured = this.onTargetAddressCaptured.bind(this);
    this.openSwap = this.openSwap.bind(this);
    this.onChainSelected = this.onChainSelected.bind(this);
    this.state = {
      chain: '',
      amount: 0
    };
  }

  onAmountCaptured(event) {
    this.setState({
      amount: event.target.value
    });
  }

  onTargetAddressCaptured(event) {
    this.setState({
      targetAddress: event.target.value
    });
  }

  openSwap() {
    this.props.openSwap(this.state);
  }

  onChainSelected(event) {
    this.setState({
      targetChain: event.target.value
    });
  }

  render() {
    if (this.props.chains.selectedChain === 'ethereum')
      return (
        <div>
          <h3>Address</h3>
          {this.props.ethereum.address}
          <h3>Ethereum Network</h3>
          {this.props.ethereum.network.name}
          <h3>Current Balances</h3>
          {this.props.ethereum.etherBalance.formatted}
          <br />
          {this.props.ethereum.dalaBalance.formatted}
          {this.props.ethereum.isLoaded && (
            <div>
              <h3>How many $DALA would you like to swap from Ethereum?</h3>
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
                <option value="stellar">Stellar</option>
              </select>
            </div>
          )}
          {this.state.targetChain === 'stellar' && <StellarTarget onTargetAddressCaptured={this.onTargetAddressCaptured} openSwap={this.openSwap} />}
        </div>
      );
    return <div />;
  }
}

EthereumSource.contextTypes = {
  drizzle: PropTypes.object
};

const mapStateToProps = state => {
  return {
    ethereum: state.ethereum
  };
};

const actions = {
  openSwap
};

export default drizzleConnect(EthereumSource, mapStateToProps, actions);
