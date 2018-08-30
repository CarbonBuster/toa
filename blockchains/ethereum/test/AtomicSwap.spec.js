const AtomicSwap = artifacts.require('AtomicSwap');
const TestToken = artifacts.require('TestToken');
const ethUtil = require('ethereumjs-util');
const moment = require('moment');
const StellarSdk = require('stellar-sdk');

contract('AtomicSwap', async accounts => {
  it('should open a new atomic swap', async () => {
    const swapId = ethUtil.bufferToHex(ethUtil.setLengthLeft(1, 32));
    const tokenValue = 1;
    const swappee = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';
    const hash = ethUtil.bufferToHex(ethUtil.setLengthLeft(1, 32));
    const timelock = moment
      .utc()
      .add(1, 'days')
      .valueOf();
    const keypair = StellarSdk.Keypair.random();
    const targetAddress = keypair.publicKey();

    const token = await TestToken.deployed();
    await token.approve(AtomicSwap.address, 1);
    const swap = await AtomicSwap.deployed();

    await swap.open(0, swapId, 1, swappee, hash, timelock, 'ethereum:stellar', targetAddress, '');

    const balance = await token.balanceOf(AtomicSwap.address);
    assert.equal(balance, tokenValue);
  });
  it('should not open an existing swap', async () => {});
  it('should not close if swap is not open', async () => {});
  it('should close if swap is open and pre-image is correct', async () => {});
  it('should not close if swap is open and pre-image is not correct', async () => {});
  it('should expire if swap is open and expirable', async () => {});
  it('should not expire if swap is open and not expirable', async () => {});
  it('should not expire if swap is not open', async () => {});
});
