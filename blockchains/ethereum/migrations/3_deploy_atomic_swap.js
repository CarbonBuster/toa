const AtomicSwap = artifacts.require('./AtomicSwap.sol');

module.exports = (deployer) => {
  deployer.deploy(AtomicSwap);
};
