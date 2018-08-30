const ToaEvent = require('../../model/ToaEvent');
const AtomicSwap = require('../contracts/AtomicSwap');

class EventWatcher {
  constructor(params) {
    const { rpcUrl, contractAddress } = params;
    this.swap = new AtomicSwap({
      rpcUrl,
      contractAddress
    });
    this.watch = this.watch.bind(this);
  }

  async watch(eventName) {
    async function createEvent(error, event) {
      if (error) {
        console.log(error); // need to alert
        return;
      }
      const {
        args: { _swapID }
      } = event;

      const { swapType, timelock, tokenAddress, tokenValue, swapper, swappee, hash, targetAddress, holdingAddress, status } = await this.swap.getSwap(
        _swapID
      );
      console.log('fields', { swapType, timelock, tokenAddress, tokenValue, swapper, swappee, hash, targetAddress, holdingAddress, status });
      const [sourceChain, targetChain] = swapType.split(':');
      const swapEvent = new ToaEvent()
        .withId(_swapID)
        .withSourceChain(sourceChain)
        .withTargetChain(targetChain)
        .withTimelock(timelock.toString())
        .withTokenAddress(tokenAddress)
        .withValue(tokenValue.toString())
        .withSwapper(swapper)
        .withSwappee(swappee)
        .withHash(hash)
        .withTargetAddress(targetAddress)
        .withHoldingAddress(holdingAddress)
        .withStatus(status.toString())
        .withEvent(event);
      await swapEvent.save();
    }

    await this.swap.load();
    this.swap.on(eventName, createEvent.bind(this));
  }
}

module.exports = EventWatcher;
