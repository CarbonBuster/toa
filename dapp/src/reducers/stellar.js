import { SET_DALA_BALANCE, SET_LOADED, SET_LUMEN_BALANCE } from '../actions/stellar';

const initialState = {
  dalaBalance: {},
  lumenBalance: {},
  isLoaded: false
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_DALA_BALANCE:
      return {
        ...state,
        dalaBalance: action.payload.balance
      };
    case SET_LOADED:
      return {
        ...state,
        isLoaded: action.payload.isLoaded
      };
    case SET_LUMEN_BALANCE:
      return {
        ...state,
        lumenBalance: action.payload.balance
      };
    default:
      return state;
  }
};
