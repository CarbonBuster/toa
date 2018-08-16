import { combineReducers } from 'redux';
import { drizzleReducers } from 'drizzle';
import chains from './chains';
import web3 from './web3';
import drizzle from './drizzle';
import ethereum from './ethereum';
import swaps from './swaps';
import {routerReducer} from 'react-router-redux/lib'

const reducer = combineReducers({
  chains,
  web3instance: web3,
  drizzle,
  ethereum,
  swaps,
  routing: routerReducer,
  ...drizzleReducers
});

export default reducer;
