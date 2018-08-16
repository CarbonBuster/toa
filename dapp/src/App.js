import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { setDrizzle } from './actions/drizzle';
import { getWeb3 } from './actions/web3';
import { drizzleConnect } from 'drizzle-react';


// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  componentDidMount(){
    this.props.setDrizzle(this.context.drizzle);
    this.props.getWeb3();
  }

  render() {
    return (
      <div className="App">
        {this.props.children}
      </div>
    );
  }
}

App.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {};
};

const actions = {
  getWeb3,
  setDrizzle
};

export default drizzleConnect(App, mapStateToProps, actions);
