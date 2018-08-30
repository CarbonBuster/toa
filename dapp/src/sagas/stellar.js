import { CLAIM, LOAD_ACCOUNT, OPEN_SWAP, setDalaBalance, setLumenBalance, setLoaded } from '../actions/stellar';
import { prepareSwap as prepareEthereumSwap } from '../actions/ethereum';
import { addSwap } from '../actions/swaps';
import { call, takeEvery, put, select } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import AtomicSwap from '../lib/stellar/AtomicSwap';
import * as SwapsService from '../services/SwapsService';
import Stellar from 'stellar-sdk';
import server from '../lib/stellar/Server';
import Big from 'big.js';
import ethUtil from 'ethereumjs-util';
import Crypto from 'crypto';

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

function* openSwap(action) {
  try {
    let targetAddress;
    const { amount, stellarAddress, stellarSecret, targetChain } = action.payload;
    const swapId = ethUtil.bufferToHex(ethUtil.setLengthLeft(Crypto.randomBytes(32), 32));
    const depositor = process.env.REACT_APP_STELLAR_DALA_DEPOSITOR;
    const { preimage, hashlock } = swap.makeHashlock();
    const { holdingKeys } = swap.makeHoldingKeys();
    const { refundTx, holdingTx, timelock } = yield call(swap.buildHoldingAccountTransaction.bind(swap), {
      hashlock,
      swapSize: new Big(amount).toFixed(7),
      holdingAccount: holdingKeys.publicKey(),
      depositorAccount: depositor,
      distributionAccount: stellarAddress
    });
    const { moveTx } = yield call(swap.buildMoveAssetToHoldingAccountTransaction, {
      distributionAccount: stellarAddress,
      holdingAccount: holdingKeys.publicKey(),
      swapSize: new Big(amount).toFixed(7)
    });
    holdingTx.sign(Stellar.Keypair.fromSecret(stellarSecret));
    holdingTx.sign(holdingKeys);
    const holdingTxResult = yield call(server.submitTransaction.bind(server), holdingTx);
    moveTx.sign(Stellar.Keypair.fromSecret(stellarSecret));
    const moveTxResult = yield call(server.submitTransaction.bind(server), moveTx);
    const payload = {
      id: swapId,
      sourceChain: 'stellar',
      sourceAddress: stellarAddress,
      targetChain,
      preimage,
      hashlock,
      amount,
      targetAddress,
      holdingAddress: holdingKeys.publicKey(),
      status: 'Open',
      timelock,
      transaction: {
        refundTx: refundTx.toEnvelope().toXDR('base64'),
        holdingTxResult,
        moveTxResult
      }
    };
    yield put(addSwap(payload));
    if (targetChain === 'ethereum') {
      // targetAddress = yield select(state => state.accounts[0]);
      console.log('putting prepareEthereumSwap action');
      yield put(prepareEthereumSwap(swapId));
    }
    yield put(push('/'));
  } catch (error) {
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export function* watchOpenSwap() {
  yield takeEvery(OPEN_SWAP, openSwap);
}
