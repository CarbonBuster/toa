const TestToken = artifacts.require('./TestToken.sol');
const AtomicSwap = artifacts.require('./AtomicSwap.sol');

const TokenAddresses = {
  develop: async () => {
    const testToken = await TestToken.deployed();
    return testToken.address;
  },
  infuraropsten: async () => '0x5d689a3de1a648f85d23231a2d95fa89ce3d41fc'
};

module.exports = (deployer, network) => {
  deployer.then(async () => {
    const tokenAddress = await TokenAddresses[network]();
    await deployer.deploy(AtomicSwap, tokenAddress);
  });
};
