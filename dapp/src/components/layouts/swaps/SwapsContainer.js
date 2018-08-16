import Swaps from './Swaps';
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

const SwapsContainer = drizzleConnect(Swaps, mapStateToProps, actions);

export default SwapsContainer;