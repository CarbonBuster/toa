const StellarSdk = require('stellar-sdk');
const StellarTransaction = require('./model/StellarTransaction');
const AtomicSwap = require('./contracts/AtomicSwap');
const server = require('./lib/Server');
const swap = new AtomicSwap({ server });

exports.performSwap = async swapData => {
  let distribution = process.env.STELLAR_DALA_DISTRIBUTION;
  let distributionSecret = process.env.STELLAR_DALA_DISTRIBUTION_SECRET;
  let distributionKeypair = StellarSdk.Keypair.fromSecret(distributionSecret);
  let { holdingKeys } = swap.makeHoldingKeys();
  let { holdingTx, refundTx } = await swap.buildHoldingAccountTransaction({
    hashlock: swapData.hash,
    swapSize: swapData.amount,
    holdingAccount: holdingKeys.publicKey(),
    depositorAccount: swapData.targetAddress,
    distributionAccount: distribution
  });
  let { moveTx } = await swap.buildMoveAssetToHoldingAccountTransaction({
    distributionAccount: distribution,
    holdingAccount: holdingKeys.publicKey(),
    swapSize: swapData.amount
  });
  //need to store the refundTx
  await new StellarTransaction()
    .withEventId(swapData.id)
    .withTransactionType(StellarTransaction.Types.Refund)
    .withTransactionEnvelope(refundTx.toEnvelope().toXDR('base64'))
    .save();
  //need to sign and submit the holding tx
  holdingTx.sign(distributionKeypair);
  await server.submitTransaction(holdingTx);
  //need to sign and submit the move tx
  moveTx.sign(distributionKeypair);
  await server.submitTransaction(moveTx);
  //need to return the holdingKeys.publicKey as holdingAddress
  return {
    holdingAddress: holdingKeys.publicKey()
  };
};
