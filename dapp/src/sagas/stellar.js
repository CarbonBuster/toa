import { CLAIM, LOAD_ACCOUNT, setDalaBalance, setLumenBalance, setLoaded } from '../actions/stellar';
import { call, takeEvery, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import AtomicSwap from '../lib/stellar/AtomicSwap';
import * as SwapsService from '../services/SwapsService';
import Stellar from 'stellar-sdk';
import server from '../lib/stellar/Server';

const swap = new AtomicSwap({
  server,
  dalaAssetCode: process.env.REACT_APP_STELLAR_DALA_ASSET_CODE,
  dalaAssetIssuer: process.env.REACT_APP_STELLAR_DALA_ASSET_ISSUER
});

function* onClaim(action) {
  try {
    let { swapId, secret } = action.payload;
    let swapData = yield call(SwapsService.getSwap, swapId);
    let { claimTx } = yield call(swap.buildClaimTransaction, {
      preimage: swapData.preimage.data,
      depositorAccount: swapData.targetAddress,
      holdingAccount: swapData.holdingAddress,
      swapSize: swapData.amount
    });
    let keypair = Stellar.Keypair.fromSecret(secret);
    claimTx.sign(keypair);
    let transactionResult = yield call(server.submitTransaction.bind(server), claimTx);
    console.log(transactionResult);
  } catch (error) {
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    throw error;
  }
  yield put(push('/'));
}

export function* watchClaim() {
  yield takeEvery(CLAIM, onClaim);
}

function getDalaBalance(account) {
  const dala = account.balances.find(
    balance =>
      balance.asset_code === process.env.REACT_APP_STELLAR_DALA_ASSET_CODE && balance.asset_issuer === process.env.REACT_APP_STELLAR_DALA_ASSET_ISSUER
  );
  if (dala) {
    return {
      balance: dala.balance,
      formatted: 'đ ' + dala.balance
    };
  }
  return {
    balance: 0,
    formatted: 'đ 0.00'
  };
}

function getLumenBalance(account) {
  const lumens = account.balances.find(balance => balance.asset_type === 'native');
  if (lumens) {
    return {
      balance: lumens.balance,
      formatted: 'XLM ' + lumens.balance
    };
  }
  return {
    balance: 0,
    formatted: 'XLM 0.00'
  };
}

function* loadAccount(action) {
  console.log(action);
  try {
    const account = yield call(server.loadAccount.bind(server), action.payload.publicKey);
    yield put(setDalaBalance(getDalaBalance(account)));
    yield put(setLumenBalance(getLumenBalance(account)));
    yield put(setLoaded(true));
  } catch (error) {
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export function* watchLoadAccount() {
  yield takeEvery(LOAD_ACCOUNT, loadAccount);
}
