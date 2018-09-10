import {
  ADD_SWAP,
  GET_SWAPS,
  GET_SWAP,
  setSwaps,
  swapUpdated,
  setSelectedSwap,
  getSwaps,
  UPDATE_SWAP,
  SWAP_UPDATED,
  UPDATE_SWAP_TRANSACTION
} from '../actions/swaps';
import { getSwap as getEthereumSwap } from '../actions/ethereum';
import { call, put, takeLatest, takeEvery, take } from 'redux-saga/effects';
import * as SwapsService from '../services/SwapsService';

function* onGetSwaps() {
  let swaps = yield call(SwapsService.getSwaps);
  yield put(setSwaps(swaps));
}

function* onGetSwap(action) {
  let swap = yield call(SwapsService.getSwap, action.payload.id);
  if (swap.sourceChain === 'ethereum' || swap.targetChain === 'ethereum') {
    yield put(getEthereumSwap(swap.id));
  }
  yield take(SWAP_UPDATED);
  swap = yield call(SwapsService.getSwap, action.payload.id);
  yield put(setSelectedSwap(swap));
}

export function* watchGetSwaps() {
  yield takeLatest(GET_SWAPS, onGetSwaps);
  yield takeEvery(GET_SWAP, onGetSwap);
}

function* onAddSwap(action) {
  let { swap } = action.payload;
  yield call(SwapsService.addSwap, swap);
  yield put(getSwaps());
}

export function* watchAddSwap() {
  yield takeLatest(ADD_SWAP, onAddSwap);
}

function* onUpdateSwap(action) {
  let { swap } = action.payload;
  yield call(SwapsService.updateSwap, swap);
  yield put(swapUpdated(swap.id));
}

function* onUpdateSwapTransaction(action) {
  console.log('onUpdateSwapTransaction', action);
  let { swap } = action.payload;
  yield call(SwapsService.updateSwapTransaction, swap);
  yield put(swapUpdated(swap.id));
}

export function* watchUpdateSwap() {
  yield takeLatest(UPDATE_SWAP, onUpdateSwap);
  yield takeLatest(UPDATE_SWAP_TRANSACTION, onUpdateSwapTransaction);
}
