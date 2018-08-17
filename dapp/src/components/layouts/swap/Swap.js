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
      return (
        <main className="container">
          <div className="pure-u-1-1 header">
            <img width="128" src={logo} alt="drizzle-logo" />
            <h1>TOA - Atomic Swaps</h1>
            <p></p>
            <br />
            <br />
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
