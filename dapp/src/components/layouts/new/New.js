import React, { Component } from 'react'
import logo from '../../../logo.png'
import EthereumSwap from '../../content/EthereumSwap';
import StellarSwap from '../../content/StellarSwap';
import PropTypes from 'prop-types';

class New extends Component {
  constructor(props, context){
    super(props);
    this.onChainSelected = this.onChainSelected.bind(this);
  }

  onChainSelected(event){
    this.props.setSelectedChain({
      chain: event.target.value
    });
  }

  render() {
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <img width="128" src={logo} alt="drizzle-logo" />
            <h1>TOA - Atomic Swaps</h1>
            <p>Swap $DALA between supported blockchains</p>
            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>Source Chain</h2>
            <select defaultValue="" onChange={this.onChainSelected}>
              <option value="" disabled>Choose Chain</option>
              <option value='ethereum'>Ethereum</option>
              <option value='stellar'>Stellar</option>
            </select>
          </div>

          <div className="pure-u-1-1">
            <EthereumSwap {...this.props}/>
            <StellarSwap {...this.props}/>
          </div>
        </div>
      </main>
    )
  }
}

New.contextTypes = {
  drizzle: PropTypes.object
}

export default New
