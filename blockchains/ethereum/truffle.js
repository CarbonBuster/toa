const secrets = require('./secrets');
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 4500000,
      network_id: "*" // Match any network id,
    },
    infuraropsten: {
      provider: function() {
        return new HDWalletProvider(secrets.ropsten.mnemonic, secrets.ropsten.infura)
      },
      from: secrets.ropsten.account,
      gasPrice: 10000000000,
      gas: 4500000,
      network_id: 3
    },
    infuramainnet: {
      provider: function() {
        return new HDWalletProvider(secrets.mainnet.mnemonic, secrets.mainnet.infura)
      },
      network_id: 1,
      gasPrice: 15000000000,
      gas: 4500000,
      from: secrets.mainnet.account
    }
  }
};
