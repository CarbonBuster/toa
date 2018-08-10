const TestToken = artifacts.require('./TestToken.sol');

module.exports = (deployer) => {
  deployer.deploy(TestToken);
};
