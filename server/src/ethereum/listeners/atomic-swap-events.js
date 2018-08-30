const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const { Statuses, Chains } = require('../../lib/constants');
const { UnhandledChainError } = require('../../lib/errors');
const { performSwap } = require('../../stellar');
const AtomicSwap = require('../contracts/AtomicSwap');

async function performTargetChainSwap(_swap, swap) {
  async function accept() {
    console.log('accept');
    const { holdingAddress } = await performSwap(_swap);
    console.log('holdingAddress', holdingAddress);
    return swap.accept(_swap.id, holdingAddress);
  }

  switch (_swap.targetChain) {
    case Chains.Stellar:
      return accept();
    default:
      throw new UnhandledChainError(swap.targetChain);
  }
}

async function closeSwap(_swap, swap) {
  return swap.close(_swap.id, _swap.preimage);
}

module.exports.onToaEvent = async event => {
  try {
    await secretsClient.load();
    const rpcUrl = process.env.ETHEREUM_RPC_URL;
    const contractAddress = process.env.ETHEREUM_ATOMIC_SWAP_ADDRESS;
    const signerAddress = `0x${process.env.ETHEREUM_SIGNER_ADDRESS}`;
    const gas = process.ETHEREUM_DEFAULT_GAS;
    const signerPrivateKey = process.env.ETHEREUM_SIGNER_PRIVATE_KEY;
    const swappee = process.env.ETHEREUM_SWAPPEE;
    const swap = new AtomicSwap({
      rpcUrl,
      contractAddress,
      signerAddress,
      signerPrivateKey,
      gas
    });
    await swap.load();
    const promises = event.Records.filter(record => record.eventName === 'INSERT').map(record => {
      const atomicSwap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      switch (atomicSwap.status) {
        case Statuses.Open:
          if (atomicSwap.swappee !== swappee) return Promise.resolve();
          return performTargetChainSwap(atomicSwap, swap);
        case Statuses.Close:
          return closeSwap(atomicSwap, swap);
        default:
          return Promise.resolve();
      }
    });
    return Promise.all(promises).catch(error => {
      console.log(error);
      throw error;
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
