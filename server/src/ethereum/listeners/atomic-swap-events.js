const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const { Statuses, Chains } = require('../../lib/constants');
const { UnhandledChainError } = require('../../lib/errors');
const { performSwap } = require('../../stellar');
const AtomicSwap = require('../contracts/AtomicSwap');

module.exports.onAtomicSwapEvent = async event => {
  await secretsClient.load();
  const rpcUrl = process.env.ETHEREUM_RPC_URL;
  const contractAddress = process.env.ETHEREUM_ATOMIC_SWAP_ADDRESS;
  const signerAddress = `0x${process.env.ETHEREUM_SIGNER_ADDRESS}`;
  const gas = process.ETHEREUM_DEFAULT_GAS;
  console.log('signerAddress', signerAddress);
  const signerPrivateKey = process.env.ETHEREUM_SIGNER_PRIVATE_KEY;
  const swap = new AtomicSwap({
    rpcUrl,
    contractAddress,
    signerAddress,
    signerPrivateKey,
    gas
  });
  await swap.load();
  let promises = event.Records.filter(record => record.eventName == 'INSERT').map(record => {
    let _swap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    switch (_swap.status) {
      case Statuses.Open:
        return performTargetChainSwap(_swap, swap);
      default:
        return;
    }
  });
  return Promise.all(promises);
};

async function performTargetChainSwap(_swap, swap) {
  switch (_swap.targetChain) {
    case Chains.Stellar:
      let { holdingAddress } = await performSwap(_swap);
      await swap.accept(_swap.id, holdingAddress);
      break;
    default:
      throw new UnhandledChainError(swap.targetChain);
  }
}
