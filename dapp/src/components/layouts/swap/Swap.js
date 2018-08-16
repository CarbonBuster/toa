import React, { Component } from 'react'
import logo from '../../../logo.png'
import EthereumSwap from '../../content/EthereumSwap';
import StellarSwap from '../../content/StellarSwap';
import PropTypes from 'prop-types';

class Swap extends Component {
  constructor(props, context){
    super(props);
  }

  componentDidMount(){
      let {chain, id} = this.props.routeParams;
      console.log('chain', chain);
      console.log('id', id);
  }

  render() {
    return (
      <div></div>
    )
  }
}

Swap.contextTypes = {
  drizzle: PropTypes.object
}

export default Swap
