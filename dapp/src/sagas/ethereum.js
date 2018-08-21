import { SET_SELECTED_CHAIN } from '../actions/chains';
import { setDalaBalance, setEtherBalance, setLoaded, OPEN_SWAP, GET_SWAP } from '../actions/ethereum';
import { addSwap, updateSwap } from '../actions/swaps';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import ethUtil from 'ethereumjs-util';
import Crypto from 'crypto';
import moment from 'moment';
import Big from 'big.js';

const DECIMALS = 10 ** 18;

const SwapStates = {
  '0': 'Invalid',
  '1': 'Open',
  '2': 'Closed',
  '3': 'Expired',
  '4': 'Accepted'
};

function* onChainSelected(action) {
  if (action.payload.chain === 'ethereum') {
    let drizzle = yield select(state => state.drizzle.instance);
    let accounts = yield select(state => state.accounts);
    let accountBalance = yield select(state => state.accountBalances[accounts[0]]);

    yield put(
      setEtherBalance({
        wei: accountBalance,
        eth: new Big(accountBalance).div(DECIMALS).valueOf(),
        formatted: 'Ξ ' + new Big(accountBalance).div(DECIMALS).toFixed(5)
      })
    );

    const address = accounts[0];
    const TestToken = drizzle.contracts.TestToken;
    const tokenBalance = yield call(TestToken.methods.balanceOf(address).call);
    yield put(
      setDalaBalance({
        wei: tokenBalance,
        eth: new Big(tokenBalance).div(DECIMALS).valueOf(),
        formatted: 'đ ' + new Big(tokenBalance).div(DECIMALS).toFixed(5)
      })
    );
    yield put(setLoaded(true));
  }
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
  console.log('swap', swap);
  yield put(updateSwap(swap));
}

function* openSwap(action) {
  console.log(action);
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
  let drizzle = yield select(state => state.drizzle.instance);
  const AtomicSwap = drizzle.contracts.AtomicSwap;
  const TestToken = drizzle.contracts.TestToken;

  //check if there is an allowance for AtomicSwap to transfer tokens on behalf of the user
  let accounts = yield select(state => state.accounts);
  const address = accounts[0];
  let allowance = yield call(TestToken.methods.allowance(address, AtomicSwap.address).call);
  console.log(allowance);
  let ballowance = new Big(allowance).div(DECIMALS);
  console.log('ballowance', ballowance.valueOf());
  if(ballowance.lt(amount)){
    alert('Need to give AtomicSwap allowance to transfer tokens on your behalf');
    yield call(TestToken.methods.approve(AtomicSwap.address, new Big(amount).times(DECIMALS).valueOf()).send);
  }

  const transaction = yield call(
    AtomicSwap.methods.open(swapId, amount * DECIMALS, TestToken.address, '0x5aeda56215b167893e80b4fe645ba6d5bab767de', hashlock, timelock, targetChain, targetAddress)
      .send
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

export function* watchSelectedChain() {
  yield takeLatest(SET_SELECTED_CHAIN, onChainSelected);
  yield takeLatest(OPEN_SWAP, openSwap);
  yield takeLatest(GET_SWAP, getSwap);
}
