const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const EthUtil = require('ethereumjs-util');
const Stellar = require('stellar-sdk');
const server = require('../lib/Server');
const { wait } = require('../../lib/utils');
const ToaEvent = require('../../model/ToaEvent');
const { Statuses, Chains } = require('../../lib/constants');

async function checkTransactionsForCorrectHashlock(_swap) {
  const transactions = await server
    .transactions()
    .forAccount(_swap.holdingAddress)
    .order('desc')
    .call();
  const filtered = transactions.records
    .map(trx => new Stellar.Transaction(trx.envelope_xdr))
    .filter(
      trx =>
        trx.signatures.length === 2 &&
        trx.operations.length === 1 &&
        trx.operations[0].type === 'payment' &&
        trx.operations[0].source === _swap.holdingAddress &&
        trx.operations[0].destination === _swap.targetAddress
    );
  const transaction = filtered.length && filtered[0];
  if (transaction) {
    const hashx = transaction.signatures[0]._attributes.signature; //eslint-disable-line
    const hashlock = `0x${EthUtil.sha256(hashx).toString('hex')}`;
    if (hashlock === _swap.hash) {
      const preimage = EthUtil.bufferToHex(hashx);
      const closeEvent = new ToaEvent()
        .withId(_swap.id)
        .withStatus(Statuses.Close)
        .withPreimage(preimage);
      await closeEvent.save();
    }
  } else {
    const updateEvent = ToaEvent.loadFrom(_swap);
    await wait(5000);
    await updateEvent.incrementAcceptCounter(1);
  }
}

async function checkTransactionForCorrectAccount(_swap) {
  const transactions = await server
    .transactions()
    .forAccount(_swap.holdingAddress)
    .order('desc')
    .call();
  const filtered = transactions.records
    .map(trx => new Stellar.Transaction(trx.envelope_xdr))
    .filter(
      trx =>
        trx.operations.length === 6 &&
        trx.signatures.length === 2 && 
        trx.operations[1].type === 'changeTrust' &&
        trx.operations[1].line && 
        trx.operations[1].line.code === process.env.STELLAR_DALA_ASSET_CODE &&
        trx.operations[1].line.issuer === process.env.STELLAR_DALA_ASSET_ISSUER &&
        trx.operations[2].type === 'setOptions' &&
        trx.operations[2].signer.ed25519PublicKey === process.env.STELLAR_SWAPPEE
    );
  if (filtered.length) {
    const updateEvent = ToaEvent.loadFrom(_swap);
    await updateEvent.setValidated(true);
  }
}

module.exports.onToaEvent = async event => {
  await secretsClient.load();
  const promises = event.Records.filter(record => record.eventName === 'INSERT' || record.eventName === 'MODIFY').map(record => {
    const atomicSwap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    switch (atomicSwap.status) {
      case Statuses.Accepted:
        if (atomicSwap.targetChain !== Chains.Stellar) return Promise.resolve();
        return checkTransactionsForCorrectHashlock(atomicSwap);
      case Statuses.Prepared:
        if (atomicSwap.sourceChain !== Chains.Stellar || atomicSwap.validated) return Promise.resolve();
        return checkTransactionForCorrectAccount(atomicSwap);
      default:
        return Promise.resolve();
    }
  });
  return Promise.all(promises);
};
