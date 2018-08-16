import { ADD_SWAP, GET_SWAPS, setSwaps, getSwaps } from '../actions/swaps';
import { call, put, takeLatest } from 'redux-saga/effects';
import * as SwapsService from '../services/SwapsService';

function* onGetSwaps() {
  let swaps = yield call(SwapsService.getSwaps);
  yield put(setSwaps(swaps));
}

export function* watchGetSwaps() {
  yield takeLatest(GET_SWAPS, onGetSwaps);
}

function* onAddSwap(action){
  let {swap} = action.payload;
  yield call(SwapsService.addSwap, swap);
  yield put(getSwaps());
}

export function* watchAddSwap(){
  yield takeLatest(ADD_SWAP, onAddSwap);
}
