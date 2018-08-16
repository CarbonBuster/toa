import New from './New';
import { setSelectedChain } from '../../../actions/chains';
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

const NewContainer = drizzleConnect(New, mapStateToProps, actions);

export default NewContainer;