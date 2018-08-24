const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const EthUtil = require('ethereumjs-util');
const Stellar = require('stellar-sdk');
const server = require('../lib/Server');
const { wait } = require('../../lib/utils');
const ToaEvent = require('../../model/ToaEvent');
const { Statuses, Chains } = require('../../lib/constants');

async function checkTransactions(_swap) {
  const transactions = await server
    .transactions()
    .forAccount(_swap.holdingAddress)
    .order('desc')
    .call();
  const filtered = transactions.records.map(trx => new Stellar.Transaction(trx.envelope_xdr)).filter(trx => {
    return (
      trx.signatures.length === 2 &&
      trx.operations.length === 1 &&
      trx.operations.length &&
      trx.operations[0].type === 'payment' &&
      trx.operations[0].source === _swap.holdingAddress &&
      trx.operations[0].destination === _swap.targetAddress
    );
  });
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

module.exports.onToaEvent = async event => {
  await secretsClient.load();
  const promises = event.Records.filter(record => record.eventName === 'INSERT' || record.eventName === 'MODIFY').map(record => {
    const atomicSwap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    if (atomicSwap.targetChain !== Chains.Stellar) return Promise.resolve();
    switch (atomicSwap.status) {
      case Statuses.Accepted:
        return checkTransactions(atomicSwap);
      default:
        return Promise.resolve();
    }
  });
  return Promise.all(promises);
};