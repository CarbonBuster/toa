import React, { Component } from 'react';
import ReactTable from 'react-table';
import logo from '../../../logo.png';

import 'react-table/react-table.css';

class Swaps extends Component {
  constructor(props, context) {
    super(props);
    this.refreshRow = this.refresh.bind(this);
    this.claim = this.claim.bind(this);
    this.columns = [
      {
        Header: 'ID',
        accessor: 'ID',
        Cell: row => <a href={`/${row.original.chain}/${row.original.id}`}>{row.value}</a>
      },
      {
        Header: 'From Chain',
        accessor: 'chain'
      },
      {
        Header: 'Time Lock',
        accessor: 'timelock',
        Cell: row => <div>{new Date(row.value * 1000).toString()}</div>
      },
      {
        Header: 'Hash',
        accessor: 'hashlock'
      },
      {
        Header: '',
        accessor: 'id',
        Cell: row => <button onClick={() => this.claim(row.value)}>Claim</button>
      },
      {
        Header: '',
        accessor: 'id',
        Cell: row => <button onClick={() => this.refresh(row.value)}>Refresh</button>
      }
    ];
  }

  claim(id) {}

  refresh(id) {
    console.log(id);
  }

  componentDidMount() {
    this.props.getSwaps();
  }

  render() {
    return (
      <main className="container">
        {/* <div className="pure-g"> */}
          <div className="pure-u-1-1 header">
            <img width="128" src={logo} alt="drizzle-logo" />
            <h1>TOA - Atomic Swaps</h1>
            <p>My Swaps</p>
            <br />
            <br />
          </div>
          {/* <div> */}
            <a href="/new">New Swap</a>
            <ReactTable data={this.props.swaps.swaps} columns={this.columns} className="-striped -highlight" {...this.selectTableProps} />
          {/* </div> */}
        {/* </div> */}
      </main>
    );
  }
}

// Swaps.contextTypes = {
//   drizzle: PropTypes.object
// };

export default Swaps;
