import Home from './Home';
import { setSelectedChain } from '../../../actions';
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
  setSelectedChain
};

const HomeContainer = drizzleConnect(Home, mapStateToProps, actions);

export default HomeContainer;