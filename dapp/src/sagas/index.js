import { all, fork } from 'redux-saga/effects';
import { drizzleSagas } from 'drizzle';
import { watchSelectedChain } from './ethereum';
import { watchGetWeb3 } from './web3';
import { watchGetSwaps, watchAddSwap, watchUpdateSwap } from './swaps';
import { watchClaim as watchStellarClaim } from './stellar';

export default function* root() {
  yield all(
    drizzleSagas
      .map(saga => fork(saga))
      .concat(fork(watchSelectedChain), fork(watchGetWeb3), fork(watchGetSwaps), fork(watchAddSwap), fork(watchUpdateSwap), fork(watchStellarClaim))
  );
}
