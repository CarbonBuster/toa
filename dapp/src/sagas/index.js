import { all, fork } from 'redux-saga/effects';
import { drizzleSagas } from 'drizzle';
import { watchAccountsFetched, watchGetSwap as watchGetEthereumSwap, watchPrepareSwap, watchOpenSwap as watchOpenEthereumSwap, watchClaim as watchEthereumClaim } from './ethereum';
import { watchGetWeb3 } from './web3';
import { watchGetSwaps, watchAddSwap, watchUpdateSwap } from './swaps';
import { watchClaim as watchStellarClaim, watchLoadAccount, watchOpenSwap as watchOpenStellarSwap } from './stellar';

export default function* root() {
  yield all(
    drizzleSagas
      .map(saga => fork(saga))
      .concat(
        fork(watchGetWeb3),
        fork(watchGetSwaps),
        fork(watchAddSwap),
        fork(watchUpdateSwap),
        fork(watchStellarClaim),
        fork(watchLoadAccount),
        fork(watchOpenStellarSwap),
        fork(watchAccountsFetched),
        fork(watchGetEthereumSwap),
        fork(watchOpenEthereumSwap),
        fork(watchEthereumClaim),
        fork(watchPrepareSwap)
      )
  );
}
