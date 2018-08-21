const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const { Statuses, Chains } = require('../../lib/constants');
const { UnhandledChainError } = require('../../lib/errors');
const { performSwap } = require('../../stellar');
const rpcUrl = process.env.ETHEREUM_RPC_URL;
const contractAddress = process.env.ETHEREUM_ATOMIC_SWAP_ADDRESS;
const AtomicSwap = require('../contracts/AtomicSwap');
const swap = new AtomicSwap({
  rpcUrl,
  contractAddress
});

module.exports.onAtomicSwapEvent = async event => {
  await secretsClient.load();
  let promises = event.Records.filter(record => record.eventName == 'INSERT').map(record => {
    let swap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    switch (swap.status) {
      case Statuses.Open:
        return performTargetChainSwap(swap);
      default:
        return;
    }
  });
  return Promise.all(promises);
};

async function performTargetChainSwap(_swap) {
  switch (_swap.targetChain) {
    case Chains.Stellar:
      let { holdingAddress } = await performSwap(_swap);
      await swap.accept(swap.id, holdingAddress);
      break;
    default:
      throw new UnhandledChainError(swap.targetChain);
  }
}
