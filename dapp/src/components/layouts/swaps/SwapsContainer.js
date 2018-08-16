import Swaps from './Swaps';
import { setDrizzle } from '../../../actions/drizzle';
import { setSelectedChain } from '../../../actions/chains';
import { getWeb3 } from '../../../actions/web3';
import { getSwaps } from '../../../actions/swaps';
import { drizzleConnect } from 'drizzle-react';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    chains: state.chains,
    AtomicSwap: state.contracts.AtomicSwap,
    drizzleStatus: state.drizzleStatus
  };
};

const actions = {
  setSelectedChain,
  getWeb3,
  setDrizzle,
  getSwaps
};

const SwapsContainer = drizzleConnect(Swaps, mapStateToProps, actions);

export default SwapsContainer;