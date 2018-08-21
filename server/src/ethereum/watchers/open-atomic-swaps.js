const AtomicSwapEvent = require('../../model/AtomicSwapEvent');
const rpcUrl = process.env.ETHEREUM_RPC_URL;
const contractAddress = process.env.ETHEREUM_ATOMIC_SWAP_ADDRESS;
const AtomicSwap = require('../contracts/AtomicSwap');
const swap = new AtomicSwap({
  rpcUrl,
  contractAddress
});

const monitorSwap = async () => {
  await swap.load();
  swap.onOpen(createEvent);

  async function createEvent(error, event) {
    if (error) {
      console.log(error); //need to alert
      return;
    }
    let {
      args: { _swapID }
    } = event;
    let { timelock, value, tokenAddress, swappee, hash, targetChain, targetAddress, status, holdingAddress } = await swap.getSwap(_swapID);
    let swapEvent = new AtomicSwapEvent()
      .withId(_swapID)
      .withTimelock(timelock.toString())
      .withValue(value.toString())
      .withTokenAddress(tokenAddress)
      .withSwappee(swappee)
      .withHash(hash)
      .withTargetChain(targetChain)
      .withXAddress(targetAddress)
      .withStatus(status.toString())
      .withCounterXAddress(holdingAddress)
      .withEvent(event);
    await swapEvent.save();
  }
};

monitorSwap();
