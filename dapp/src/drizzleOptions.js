import AtomicSwap from '../contracts/AtomicSwap.json'
import DalaToken from '../contracts/DalaToken.json'

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
    DalaToken
  ],
  events: {
    AtomicSwap: ['Open','Expire','Close'],
    DalaToken: ['Approval','Transfer']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions