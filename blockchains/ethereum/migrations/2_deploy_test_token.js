const TestToken = artifacts.require('./TestToken.sol');

module.exports = (deployer, network) => {
  if(network === 'develop'){
    console.log('deploying TestToken');
    deployer.deploy(TestToken);
  }
};
