const ToaEvent = require('../../model/ToaEvent');
const AtomicSwap = require('../contracts/AtomicSwap');

class EventWatcher {
  constructor(params) {
    let { rpcUrl, contractAddress } = params;
    this.swap = new AtomicSwap({
      rpcUrl,
      contractAddress
    });
    this.watch = this.watch.bind(this);
  }

  async watch(eventName) {
    await this.swap.load();
    this.swap.on(eventName, createEvent.bind(this));
  
    async function createEvent(error, event) {
      if (error) {
        console.log(error); //need to alert 
        return;
      }
      const {
        args: { _swapID }
      } = event;
      const { timelock, value, tokenAddress, swappee, hash, targetChain, targetAddress, status, holdingAddress } = await this.swap.getSwap(_swapID);
      const swapEvent = new ToaEvent()
        .withId(_swapID)
        .withTimelock(timelock.toString())
        .withValue(value.toString())
        .withTokenAddress(tokenAddress)
        .withSwappee(swappee)
        .withHash(hash)
        .withTargetChain(targetChain)
        .withTargetAddress(targetAddress)
        .withStatus(status.toString())
        .withHoldingAddress(holdingAddress)
        .withEvent(event);
      await swapEvent.save();
    }
  }
}

module.exports = EventWatcher;
