import { CLAIM } from '../actions/stellar';
import { call, takeEvery } from 'redux-saga/effects';
import AtomicSwap from '../lib/stellar/AtomicSwap';
import * as SwapsService from '../services/SwapsService';
import Stellar from 'stellar-sdk';
import server from '../lib/stellar/Server';
console.log('SERVER', server);
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
}

export function* watchClaim() {
  yield takeEvery(CLAIM, onClaim);
}
