const SmartContractBase = require('./SmartContractBase');
const contract = require('../../../lib/AtomicSwap.json');

class AtomicSwap extends SmartContractBase {
  constructor(params){
    super(contract, params);
  }

  onOpen(watcher) {
    const event = this.contractInstance.Open();
    event.watch(watcher);
  }

  onExpire(watcher) {
    const event = this.contractInstance.Expire();
    event.watch(watcher);
  }

  onClose(watcher) {
    const event = this.contractInstance.Close();
    event.watch(watcher);
  }

  onAccept(watcher) {
    const event = this.contractInstance.Accept();
    event.watch(watcher);
  }

  async getSwap(id) {
    const [swapType, timelock, tokenAddress, tokenValue, swapper, swappee, hash, targetAddress, holdingAddress, status] = await this.contractInstance.getSwap(id);
    return {
      swapType,
      timelock,
      tokenValue,
      tokenAddress,
      swappee,
      swapper,
      hash,
      targetAddress,
      status,
      holdingAddress
    };
  }

  async accept(id, holdingAddress) {
    const transaction = await this.contractInstance.accept(id, holdingAddress, {
      from: this.signerAddress,
      gas: this.gas
    });
    return transaction;
  }

  async close(id, preimage) {
    const transaction = await this.contractInstance.close(id, preimage, {
      from: this.signerAddress,
      gas: this.gas
    });
    return transaction;
  }

  async open(id, value, swappee, hash, timelock, sourceChain, targetChain, targetAddress, holdingAddress) {
    const transaction = await this.contractInstance.open(0, id, value, swappee, hash, timelock, `${sourceChain}:${targetChain}`, targetAddress, holdingAddress, {
      from: this.signerAddress,
      gas: this.gas
    });
    return transaction;
  }
}

module.exports = AtomicSwap;
