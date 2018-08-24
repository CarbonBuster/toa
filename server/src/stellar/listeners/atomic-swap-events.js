const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const server = require('../lib/Server');
const ToaEvent = require('../../model/ToaEvent');
const { Statuses, Chains } = require('../../lib/constants');
const EthUtil = require('ethereumjs-util');
const Stellar = require('stellar-sdk');

module.exports.onToaEvent = async event => {
  await secretsClient.load();
  let promises = event.Records.filter(record => record.eventName == 'INSERT' || record.eventName == 'MODIFY').map(record => {
    let _swap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    console.log('swap', _swap);
    if (_swap.targetChain !== Chains.Stellar) return;
    console.log('targetChain is stellar');
    switch (_swap.status) {
      case Statuses.Accepted:
        console.log('status is Accepted');
        return checkTransactions(_swap);
      default:
        console.log('status is not Accepted');
        return;
    }
  });
  return Promise.all(promises);
};

async function checkTransactions(_swap) {
  let transactions = await server
    .transactions()
    .forAccount(_swap.holdingAddress)
    .order('desc')
    .call();
  console.log('transactions', transactions);
  //need to filter these transactions to find the payment to the target address
  let filtered = transactions.records.map(trx => new Stellar.Transaction(trx.envelope_xdr)).filter(trx => {
    return (
      trx.signatures.length === 2 &&
      trx.operations.length === 1 &&
      trx.operations.length &&
      trx.operations[0].type === 'payment' &&
      trx.operations[0].source === _swap.holdingAddress &&
      trx.operations[0].destination === _swap.targetAddress
    );
  });
  //there should only be one
  let transaction = filtered.length && filtered[0];
  if (transaction) {
    //write an event to instruct the close - this should use the transaction-hash as id so we don't duplicate - OR it could update the existing entry?
    let hashx = transaction.signatures[0]._attributes.signature;
    let hashlock = `0x${EthUtil.sha256(hashx).toString('hex')}`;
    if (hashlock == _swap.hash) {
      //confirm the preimage is correct before creating event
      let preimage = EthUtil.bufferToHex(hashx);
      let closeEvent = new ToaEvent()
        .withId(_swap.id)
        .withStatus(Statuses.Close)
        .withPreimage(preimage);
      await closeEvent.save();
    }
  } else {
    //update the current event with a counter - this will get it picked up by the event listener again
    let updateEvent = ToaEvent.loadFrom(_swap);
    await wait(1000);
    await updateEvent.incrementAcceptCounter(1);
  }
}

async function wait(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}
