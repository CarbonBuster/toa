import React, { Component } from 'react';
import logo from '../../../logo.png';
import PropTypes from 'prop-types';

class Swap extends Component {
  constructor(props, context) {
    super(props);
  }

  componentDidMount() {
    let { id } = this.props.routeParams;
    console.log('id', id);
    this.props.getSwap(id);
  }

  render() {
    if (this.props.selectedSwap) {
      let timelock = new Date(this.props.selectedSwap.timelock*1000);
      return (
        <main className="container">
          <div className="pure-u-1-1 header">
            <img width="128" src={logo} alt="drizzle-logo" />
            <h1>TOA - Atomic Swaps</h1>
            <p></p>
            <p>{`ID: ${this.props.selectedSwap.id}`}</p>
            <p>{`Amount: đ ${this.props.selectedSwap.amount}`}</p>
            <p>{`Source Chain: ${this.props.selectedSwap.sourceChain}`}</p>
            <p>{`Target Chain: ${this.props.selectedSwap.targetChain}`}</p>
            <p>{`Timelock: ${timelock}`}</p>
            <p>{`Hashlock: ${this.props.selectedSwap.hashlock}`}</p>
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
