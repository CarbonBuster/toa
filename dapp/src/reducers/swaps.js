import { SET_SWAPS, SET_SELECTED_SWAP } from '../actions/swaps';

const initialState = {
  swaps: [],
  selectedSwap: null
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_SWAPS:
      return {
        ...state,
        swaps: action.payload.swaps
      };
    case SET_SELECTED_SWAP:
      return {
        ...state,
        selectedSwap: action.payload.swap
      };
    default:
      return state;
  }
};
