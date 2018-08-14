import { SET_DALA_BALANCE, SET_ETHER_BALANCE, SET_LOADED } from '../actions/ethereum';

const initialState = {
  dalaBalance: {},
  etherBalance: {},
  isLoaded: false
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_DALA_BALANCE:
      return {
          ...state,
          dalaBalance: action.payload.balance
      }
    case SET_ETHER_BALANCE:
      return {
          ...state,
          etherBalance: action.payload.balance
      }
    case SET_LOADED:
      return {
        ...state,
        isLoaded: action.payload.isLoaded
      }
    default:
      return state;
  }
};
