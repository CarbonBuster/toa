import { combineReducers } from 'redux';
import { drizzleReducers } from 'drizzle';
import chains from './chains';
import web3 from './web3';
import drizzle from './drizzle';
import ethereum from './ethereum';
import {routerReducer} from 'react-router-redux/lib'

const reducer = combineReducers({
  chains,
  web3instance: web3,
  drizzle,
  ethereum,
  routing: routerReducer,
  ...drizzleReducers
});

export default reducer;
