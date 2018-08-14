import { GET_WEB3, setWeb3 } from '../actions/web3';
import { call, put, take, select, takeLatest } from 'redux-saga/effects';
import Web3 from 'web3';

export function* onGetWeb3(action) {
  if (typeof window.web3 !== 'undefined') {
    let web3 = new Web3(window.web3.currentProvider);
    let action = setWeb3(web3);
    yield put(action);
  } else {
    yield put(setWeb3(null));
  }
}

export function* watchGetWeb3() {
  yield takeLatest(GET_WEB3, onGetWeb3);
}
