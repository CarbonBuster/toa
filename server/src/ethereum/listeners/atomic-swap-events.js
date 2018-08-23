const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const { Statuses, Chains } = require('../../lib/constants');
const { UnhandledChainError } = require('../../lib/errors');
const { performSwap } = require('../../stellar');
const AtomicSwap = require('../contracts/AtomicSwap');

module.exports.onToaEvent = async event => {
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
  let promises = event.Records.filter(record => record.eventName == 'INSERT').map(record => {
    let _swap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    switch (_swap.status) {
      case Statuses.Open:
        if(_swap.swappee !== swappee) return;//only handle the 'Open' events where we are the swappee
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
      //need to start listening to transactions on this holding address OR the target address
      //maybe write an event to start listening here OR let the state change listener do it OR both for redundancy
      break;
    default:
      throw new UnhandledChainError(swap.targetChain);
  }
}
