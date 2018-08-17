import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { openSwap } from '../../../actions/ethereum';

class EthereumSwap extends Component {
  constructor(props) {
    super(props);
    this.onAmountCaptured = this.onAmountCaptured.bind(this);
    this.onXAddressCaptured = this.onXAddressCaptured.bind(this);
    this.openSwap = this.openSwap.bind(this);
    this.onChainSelected = this.onChainSelected.bind(this);
    this.state = {
      chain: ''
    }
  }

  onAmountCaptured(event) {
    this.setState({
      amount: event.target.value
    });
  }

  onXAddressCaptured(event) {
    this.setState({
      xAddress: event.target.value
    });
  }

  openSwap(event) {
    this.props.openSwap(this.state);
  }

  onChainSelected(event) {
    this.setState({
      targetChain: event.target.value
    })
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
              <input type="text" onChange={this.onAmountCaptured} />
              <h2>Target Chain</h2>
              <select defaultValue="" onChange={this.onChainSelected}>
                <option value="" disabled>
                  Choose Chain
                </option>
                <option value="stellar">Stellar</option>
              </select>
            </div>
          )}
          {this.state.targetChain === 'stellar' && (
            <div>
              <h3>What is your Stellar address</h3>
              <input type="text" onChange={this.onXAddressCaptured} />
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
};

export default drizzleConnect(EthereumSwap, mapStateToProps, actions);
