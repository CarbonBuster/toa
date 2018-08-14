import { SET_WEB3 } from '../actions/web3';

const initialState = {
  instance: null
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_WEB3:
      return {
        ...state,
        instance: action.payload.web3
      };
    default:
      return state;
  }
};
