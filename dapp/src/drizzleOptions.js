import AtomicSwap from './../../blockchains/ethereum/build/contracts/AtomicSwap.json'
import TestToken from './../../blockchains/ethereum/build/contracts/TestToken.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    AtomicSwap,
    TestToken
  ],
  events: {
    AtomicSwap: ['Open','Expire','Close'],
    TestToken: ['Approval','Transfer']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions