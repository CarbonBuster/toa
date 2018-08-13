import { combineReducers } from 'redux';
import { drizzleReducers } from 'drizzle';
import chains from './chains';
import {routerReducer} from 'react-router-redux'

const reducer = combineReducers({
  chains,
  routing: routerReducer,
  ...drizzleReducers
});

export default reducer;
