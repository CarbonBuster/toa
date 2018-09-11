import { setDalaBalance, setEtherBalance, setLoaded, setAddress, setNetwork, OPEN_SWAP, GET_SWAP, PREPARE_SWAP, CLAIM } from '../actions/ethereum';
import { addSwap, updateSwap, updateSwapTransaction } from '../actions/swaps';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import ethUtil from 'ethereumjs-util';
import Crypto from 'crypto';
import moment from 'moment';
import Big from 'big.js';
import * as SwapsService from '../services/SwapsService';

const DECIMALS = 10 ** 18;

const SwapStates = {
  '0': 'Invalid',
  '1': 'Open',
  '2': 'Closed',
  '3': 'Expired',
  '4': 'Accepted'
};

const Networks = {
  '1': 'Main',
  '3': 'Ropsten',
  '4': 'Rinkeby',
  '42': 'Kovan'
};

const Operations = {
  Open: 0,
  Prepare: 1
};

function* onAccountsFetched(action) {
  let drizzle = yield select(state => state.drizzle.instance);

  let accounts = yield select(state => state.accounts);

  let accountBalance = yield select(state => state.accountBalances[accounts[0]]);
  if (!accountBalance) return;

  yield put(setAddress(accounts[0]));

  yield put(
    setEtherBalance({
      wei: accountBalance,
      eth: new Big(accountBalance).div(DECIMALS).valueOf(),
      formatted: 'Ξ ' + new Big(accountBalance).div(DECIMALS).toFixed(5)
    })
  );

  const address = accounts[0];
  const DalaToken = drizzle.contracts.DalaToken;
  const tokenBalance = yield call(DalaToken.methods.balanceOf(address).call);
  yield put(
    setDalaBalance({
      wei: tokenBalance,
      eth: new Big(tokenBalance).div(DECIMALS).valueOf(),
      formatted: 'đ ' + new Big(tokenBalance).div(DECIMALS).toFixed(5)
    })
  );

  const web3 = yield select(state => state.web3);
  yield put(
    setNetwork({
      id: web3.networkId,
      name: Networks[web3.networkId]
    })
  );

  yield put(setLoaded(true));
}

function* getSwap(action) {
  const { id } = action.payload;
  let drizzle = yield select(state => state.drizzle.instance);
  const AtomicSwap = drizzle.contracts.AtomicSwap;
  const swapFields = yield call(AtomicSwap.methods.getSwap(id).call);
  console.log('swapFields', swapFields);
  const swap = {
    id,
    hashlock: swapFields.hash,
    status: SwapStates[swapFields.states],
    timelock: swapFields.timelock,
    amount: new Big(swapFields.tokenValue).div(DECIMALS).valueOf(),
    targetAddress: swapFields.targetAddress,
    holdingAddress: swapFields.holdingAddress
  };
  yield put(updateSwap(swap));
}

function* prepareSwap(action) {
  const swap = yield call(SwapsService.getSwap, action.payload.id);
  const drizzle = yield select(state => state.drizzle.instance);
  const accounts = yield select(state => state.accounts);
  const address = accounts[0];
  const AtomicSwap = drizzle.contracts.AtomicSwap;

  const prepareTransaction = yield call(
    AtomicSwap.methods.open(
      Operations.Prepare,
      swap.id,
      Number(new Big(swap.amount).times(DECIMALS).valueOf()),
      address,
      ethUtil.bufferToHex(ethUtil.setLengthLeft(swap.hashlock, 32)),
      swap.timelock,
      `${swap.sourceChain}:${swap.targetChain}`,
      address,
      swap.holdingAddress
    ).send
  );

  const payload = {
    id: swap.id,
    transaction: {
      prepareTransaction
    }
  };
  console.log('calling put(updateSwapTransaction)');
  yield put(updateSwapTransaction(payload));
}

function* openSwap(action) {
  const { amount, targetAddress, targetChain } = action.payload;

  //generate swap ID
  const swapId = ethUtil.bufferToHex(ethUtil.setLengthLeft(Crypto.randomBytes(32), 32));

  //generate random 32 byte hash
  const preimage = Crypto.randomBytes(32);
  const hash = Crypto.createHash('sha256');
  hash.update(preimage);
  const hashlock = ethUtil.bufferToHex(ethUtil.setLengthLeft(hash.digest(), 32));
  const timelock =
    moment
      .utc()
      .add(10, 'seconds') //just for testing
      // .add(1, 'hour')
      .valueOf() / 1000;

  //call contract
  const drizzle = yield select(state => state.drizzle.instance);
  const AtomicSwap = drizzle.contracts.AtomicSwap;
  const DalaToken = drizzle.contracts.DalaToken;

  //check if there is an allowance for AtomicSwap to transfer tokens on behalf of the user
  const accounts = yield select(state => state.accounts);
  const address = accounts[0];
  const allowance = yield call(DalaToken.methods.allowance(address, AtomicSwap.address).call);
  const ballowance = new Big(allowance).div(DECIMALS);
  if (ballowance.lt(amount)) {
    alert('Need to give AtomicSwap allowance to transfer tokens on your behalf');
    yield call(DalaToken.methods.approve(AtomicSwap.address, new Big(amount).times(DECIMALS).valueOf()).send);
  }

  const transaction = yield call(
    AtomicSwap.methods.open(
      Operations.Open,
      swapId,
      Number(new Big(amount).times(DECIMALS).valueOf()),
      process.env.REACT_APP_ETHEREUM_SWAP_TARGET,
      hashlock,
      timelock,
      `ethereum:${targetChain}`,
      targetAddress,
      ''
    ).send
  );

  const payload = {
    id: swapId,
    sourceChain: 'ethereum',
    targetChain,
    preimage,
    hashlock,
    timelock,
    amount,
    targetAddress,
    transaction,
    status: 'Open'
  };
  yield put(addSwap(payload));
  yield put(push('/'));
}

function* onClaim(action) {
  let { swapId } = action.payload;
  let swapData = yield call(SwapsService.getSwap, swapId);
  const drizzle = yield select(state => state.drizzle.instance);
  const AtomicSwap = drizzle.contracts.AtomicSwap;
  const closeTransaction = yield call(
    AtomicSwap.methods.close(swapId, ethUtil.bufferToHex(swapData.preimage.data)).send
  );
  yield put(updateSwapTransaction({
    id: swapId,
    transaction: {
      closeTransaction
    }
  }))
  yield put(push('/'));
}

export function* watchOpenSwap() {
  yield takeLatest(OPEN_SWAP, openSwap);
}

export function* watchGetSwap() {
  yield takeLatest(GET_SWAP, getSwap);
}

export function* watchPrepareSwap() {
  yield takeLatest(PREPARE_SWAP, prepareSwap);
}

export function* watchAccountsFetched() {
  yield takeLatest('ACCOUNTS_FETCHED', onAccountsFetched);
}

export function* watchClaim() {
  yield takeLatest(CLAIM, onClaim);
}
