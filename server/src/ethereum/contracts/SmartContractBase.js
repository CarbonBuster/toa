const TruffleContract = require('truffle-contract');
const ProviderEngine = require('web3-provider-engine');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const HookedWalletEthTxSubprovider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx');

class SmartContractBase {
  /**
   *
   * @param {object} params The parameters to initialize the atomic swap
   * @param {object} params.contract    The contract definition
   * @param {string} params.rpcUrl  The RPC URL
   * @param {string} params.contractAddress The address of the atomic swap smart contract
   * @param {string} [params.signerAddress]   The address of the account that can sign transactions on this contract
   * @param {string} [params.signerPrivateKey]  The private key of the signer address for this contract
   */
  constructor(contract, params) {
    this.signerAddress = params.signerAddress;
    this.gas = params.gas;

    const { rpcUrl, contractAddress } = params;
    this.contractAddress = contractAddress;
    this.contract = TruffleContract(contract);

    this.engine = new ProviderEngine();
    this.engine.addProvider(new FilterSubprovider());

    if (params.signerAddress && params.signerPrivateKey) {
      this.engine.addProvider(
        new HookedWalletEthTxSubprovider({
          getAccounts: cb => cb(null, [params.signerAddress]),
          getPrivateKey: (address, cb) => cb(null, address === params.signerAddress && Buffer.from(params.signerPrivateKey, 'hex'))
        })
      );
    }

    this.engine.addProvider(new RpcSubprovider({ rpcUrl }));
    this.contract.setProvider(this.engine);
    this.contract.defaults({
      from: params.signerAddress,
      gas: params.gas
    });
    this.engine.start();
  }

  async load() {
    this.contractInstance = await this.contract.at(this.contractAddress);
  }

  on(eventName, watcher) {
    const event = this.contractInstance[eventName] && this.contractInstance[eventName]();
    return event && event.watch(watcher);
  }
}

module.exports = SmartContractBase;