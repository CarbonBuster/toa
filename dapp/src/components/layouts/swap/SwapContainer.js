import Swap from './Swap';
import { getSwap } from '../../../actions/swaps';
import { drizzleConnect } from 'drizzle-react';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    selectedSwap: state.swaps.selectedSwap
  };
};

const actions = {
  getSwap
};

const SwapContainer = drizzleConnect(Swap, mapStateToProps, actions);

export default SwapContainer;