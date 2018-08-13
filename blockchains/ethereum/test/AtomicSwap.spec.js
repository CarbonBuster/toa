const AtomicSwap = artifacts.require('AtomicSwap');
const TestToken = artifacts.require('TestToken');
const ethUtil = require('ethereumjs-util');
const moment = require('moment');
const StellarSdk = require('stellar-sdk');

contract('AtomicSwap', async accounts => {
  it('should open a new atomic swap', async () => {
    let swapId = ethUtil.bufferToHex(ethUtil.setLengthLeft(1, 32));
    let tokenValue = 1;
    let tokenAddress = TestToken.address;
    let swappee = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';
    let hash = ethUtil.bufferToHex(ethUtil.setLengthLeft(1, 32));
    let timelock = moment
      .utc()
      .add(1, 'days')
      .milliseconds();
    let keypair = StellarSdk.Keypair.random();
    let xAddress = keypair.publicKey();

    let token = await TestToken.deployed();
    await token.approve(AtomicSwap.address, 1)
    let swap = await AtomicSwap.deployed();
    await swap.open(swapId, 1, tokenAddress, swappee, hash, timelock, xAddress);

    let balance = await token.balanceOf(AtomicSwap.address);
    assert.equal(balance, tokenValue);
  });
  it('should not open an existing swap', async () => {

  });
  it('should not close if swap is not open', async () => {});
  it('should close if swap is open and pre-image is correct', async () => {});
  it('should not close if swap is open and pre-image is not correct', async () => {});
  it('should expire if swap is open and expirable', async () => {});
  it('should not expire if swap is open and not expirable', async () => {});
  it('should not expire if swap is not open', async () => {});
});
