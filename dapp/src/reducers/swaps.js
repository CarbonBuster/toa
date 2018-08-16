import {SET_SWAPS} from '../actions/swaps';

const initialState = {
    swaps: []
}

export default (state = initialState, action = {}) => {
    switch (action.type) {
      case SET_SWAPS:
        return {
          ...state,
          swaps: action.payload.swaps
        };
      default:
        return state;
    }
  };