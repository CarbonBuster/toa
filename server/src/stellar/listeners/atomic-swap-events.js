const secretsClient = require('serverless-secrets/client');
const AWS = require('aws-sdk');
const server = require('../lib/Server');
const AtomicSwapEvent = require('../../model/AtomicSwapEvent');
const { Statuses, Chains } = require('../../lib/constants');
const EthUtil = require('ethereumjs-util');

module.exports.onToaEvent = async event => {
  await secretsClient.load();
  let promises = event.Records.filter(record => record.eventName == 'INSERT' || record.eventName == 'UPDATE').map(record => {
    let _swap = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    if (_swap.targetChain !== Chains.Stellar) return;
    switch (_swap.status) {
      case Statuses.Accepted:
        return checkTransactions(_swap);
      default:
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
  //need to filter these transactions to find the payment to the target address
  let filtered = transactions.filter(trx => {
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
  let event = new AtomicSwapEvent();
  if (transaction) {
    //write an event to instruct the close - this should use the transaction-hash as id so we don't duplicate - OR it could update the existing entry?
    let hashx = trx.signatures[0]._attributes.signature;
    let hashlock = util.sha256(hashx).toString('hex');
    if (hashlock === _swap.hashlock) {
        //confirm the preimage is correct before creating event
      let preimage = EthUtil.bufferToHex(sig1);
      let closeEvent = new AtomicSwapEvent().withId(_swap.id).withStatus(Statuses.Close).withPreimage(preimage);
      await closeEvent.save();
    }
  } else {
    //update the current event with a counter - this will get it picked up by the event listener again
    let updateEvent = AtomicSwapEvent.loadFrom(_swap);
    await wait(1000);
    await updateEvent.incrementAcceptCounter(1);
  }
}

async function wait(delay){
    return new Promise((resolve)=>{
        setTimeout(resolve, delay);
    })
}
