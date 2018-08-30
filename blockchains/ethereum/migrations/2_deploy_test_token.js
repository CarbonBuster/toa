const TestToken = artifacts.require('./TestToken.sol');

module.exports = (deployer, network) => {
  if(network === 'develop'){
    deployer.deploy(TestToken);
  }
};
