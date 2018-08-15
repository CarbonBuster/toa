const TruffleContract = require('truffle-contract');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const RcpSubprovider = require('web3-provider-engine/subproviders/rpc.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const AtomicSwapEvent = require('./AtomicSwapEvent');

const rpcUrl = process.env.RPC_URL;
const ATOMIC_SWAP_ADDRESS = process.env.ATOMIC_SWAP_ADDRESS;

const contract = require('../../lib/AtomicSwap.json');
const AtomicSwap = TruffleContract(contract);

const engine = new ProviderEngine();
engine.addProvider(new FilterSubprovider());
engine.addProvider(new RcpSubprovider({ rpcUrl }));

const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

const monitorSwap = async () => {
  AtomicSwap.setProvider(engine);
  let swap = await AtomicSwap.at(ATOMIC_SWAP_ADDRESS);
  let open = swap.Open();
  open.watch(createEvent);

  async function createEvent(error, event) {
    console.log('error', error);
    console.log('event', event);
    let {
      args: { _swapID }
    } = event;
    let [timelock, value, tokenAddress, swappee, hash, xAddress, status] = await swap.check(_swapID);
    let swapEvent = new AtomicSwapEvent()
      .withId(_swapID)
      .withTimelock(timelock.toString())
      .withValue(value.toString())
      .withTokenAddress(tokenAddress)
      .withSwappee(swappee)
      .withHash(hash)
      .withXAddress(xAddress)
      .withStatus(status)
      .withEvent(event);
    await swapEvent.save();
  }
};

engine.start();
monitorSwap();
