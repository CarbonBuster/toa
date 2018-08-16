import Swap from './Swap';
import { getSwaps } from '../../../actions/swaps';
import { drizzleConnect } from 'drizzle-react';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    swaps: state.swaps
  };
};

const actions = {
  getSwaps
};

const SwapContainer = drizzleConnect(Swap, mapStateToProps, actions);

export default SwapContainer;