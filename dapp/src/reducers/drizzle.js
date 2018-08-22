import { SET_DRIZZLE } from '../actions/drizzle';

const initialState = {
  instance: null
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_DRIZZLE:
      console.log(action);
      return {
          ...state,
          instance: action.payload.drizzle
      }
    default:
      return state;
  }
};
