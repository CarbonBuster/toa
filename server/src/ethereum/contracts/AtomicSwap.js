const TruffleContract = require('truffle-contract');
const ProviderEngine = require('web3-provider-engine');
const RcpSubprovider = require('web3-provider-engine/subproviders/rpc.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const HookedWalletEthTxSubprovider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx');
const contract = require('../../../lib/AtomicSwap.json');

class AtomicSwap {
  /**
   *
   * @param {object} params The parameters to initialize the atomic swap
   * @param {string} params.rpcUrl  The RPC URL
   * @param {string} params.contractAddress The address of the atomic swap smart contract
   * @param {string} [params.signerAddress]   The address of the account that can sign transactions on this contract
   * @param {string} [params.signerPrivateKey]  The private key of the signer address for this contract
   */
  constructor(params) {
    let rpcUrl = params.rpcUrl;
    this.contractAddress = params.contractAddress;
    this.contract = TruffleContract(contract);

    this.engine = new ProviderEngine();
    this.engine.addProvider(new FilterSubprovider());
    this.engine.addProvider(new RcpSubprovider({ rpcUrl }));

    if (params.signerAddress && params.signerPrivateKey) {
      engine.addProvider(
        new HookedWalletEthTxSubprovider({
          getAccounts: cb => {
            return cb(null, [params.signerAddress]);
          },
          getPrivateKey: (address, cb) => {
            cb(null, new Buffer(params.signerPrivateKey, 'hex'));
          }
        })
      );
    }

    this.contract.setProvider(this.engine);
    this.engine.start();
  }

  async load() {
    this.swap = await this.contract.at(this.contractAddress);
  }

  onOpen(watcher) {
    let event = this.swap.Open();
    event.watch(watcher);
  }

  async getSwap(id) {
    let [timelock, value, tokenAddress, swappee, hash, targetChain, targetAddress, status, holdingAddress] = await this.swap.getSwap(id);
    return {
      timelock,
      value,
      tokenAddress,
      swappee,
      hash,
      targetChain,
      targetAddress,
      status,
      holdingAddress
    };
  }

  async accept(id, holdingAddress) {
    await this.swap.accept(id, holdingAddress);
  }
}

module.exports = AtomicSwap;
