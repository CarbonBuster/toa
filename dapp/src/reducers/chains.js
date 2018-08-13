import { SET_SELECTED_CHAIN } from '../actions/chains';

const initialState = {
  selectedChain: ''
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_SELECTED_CHAIN:
      let newState = {
        ...state,
        selectedChain: action.payload.chain
      };
      return newState;
    default:
      return state;
  }
};
