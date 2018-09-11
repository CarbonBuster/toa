import React, { Component } from 'react';
import logo from '../../../logo.png';
import PropTypes from 'prop-types';

class Swap extends Component {
  constructor(props, context) {
    super(props);
    this.onStellarSecretChanged = this.onStellarSecretChanged.bind(this);
    this.claimStellar = this.claimStellar.bind(this);
    this.claimEthereum = this.claimEthereum.bind(this);
    this.state = {};
  }

  componentDidMount() {
    let { id } = this.props.routeParams;
    console.log('id', id);
    this.props.getSwap(id);
  }

  onStellarSecretChanged(event) {
    this.setState({
      stellarSecret: event.target.value
    });
  }

  claimStellar() {
    let swap = this.props.selectedSwap;
    let secret = this.state.stellarSecret;
    this.props.claimStellar(swap.id, secret);
  }

  claimEthereum(){
    let swap = this.props.selectedSwap;
    this.props.claimEthereum(swap.id);
  }

  render() {
    if (this.props.selectedSwap) {
      let timelock = new Date(this.props.selectedSwap.timelock * 1000);
      return (
        <main className="container">
          <div className="pure-u-1-1 header">
            <img width="128" src={logo} alt="drizzle-logo" />
            <h1>TOA - Atomic Swaps</h1>
            <p />
            <p>{`ID: ${this.props.selectedSwap.id}`}</p>
            <p>{`Amount: đ ${this.props.selectedSwap.amount}`}</p>
            <p>{`Source Chain: ${this.props.selectedSwap.sourceChain}`}</p>
            <p>{`Target Chain: ${this.props.selectedSwap.targetChain}`}</p>
            <p>{`Target Address: ${this.props.selectedSwap.targetAddress}`}</p>
            <p>{`Timelock: ${timelock}`}</p>
            <p>{`Hashlock: ${this.props.selectedSwap.hashlock}`}</p>
            <p>{`Status: ${this.props.selectedSwap.status}`}</p>
            <p>{`Holding Address: ${this.props.selectedSwap.holdingAddress}`}</p>
            <p />
            {this.props.selectedSwap.targetChain === 'stellar' &&
              this.props.selectedSwap.status === 'Accepted' && (
                <div>
                  <p><b>Stellar Secret</b></p>
                  <input type="password" name="stellarSecret" onChange={this.onStellarSecretChanged} />
                  <p>
                    <button onClick={this.claimStellar}>Claim</button>
                  </p>
                </div>
              )}
            {this.props.selectedSwap.targetChain === 'ethereum' &&
              this.props.selectedSwap.status === 'Open' && (
                <div>
                  <p>
                    <button onClick={this.claimEthereum}>Claim</button>
                  </p>
                </div>
              )}
          </div>
        </main>
      );
    } else {
      return <div />;
    }
  }
}

Swap.contextTypes = {
  drizzle: PropTypes.object
};

export default Swap;
