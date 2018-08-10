import AtomicSwap from './../../blockchains/ethereum/build/contracts/AtomicSwap.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    AtomicSwap
  ],
  events: {
    AtomicSwap: ['Open','Expire','Close']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions