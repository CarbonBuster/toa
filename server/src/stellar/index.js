const Big = require('big.js');
const EthereumUtils = require('ethereumjs-util');
const StellarSdk = require('stellar-sdk');
const StellarTransaction = require('./model/StellarTransaction');
const { StellarTransactionTypes } = require('./lib/constants');
const AtomicSwap = require('./contracts/AtomicSwap');
const server = require('./lib/Server');

const swap = new AtomicSwap({
  server,
  dalaAssetCode: process.env.STELLAR_DALA_ASSET_CODE,
  dalaAssetIssuer: process.env.STELLAR_DALA_ASSET_ISSUER
});

exports.performSwap = async swapData => {
  try {
    const distribution = process.env.STELLAR_DALA_DISTRIBUTION;
    const distributionSecret = process.env.STELLAR_DALA_DISTRIBUTION_SECRET;
    const distributionKeypair = StellarSdk.Keypair.fromSecret(distributionSecret);
    const { holdingKeys } = AtomicSwap.makeHoldingKeys();
    const { holdingTx, refundTx } = await swap.buildHoldingAccountTransaction({
      hashlock: EthereumUtils.toBuffer(swapData.hash),
      swapSize: new Big(swapData.value).div(10 ** 18).toFixed(7),
      holdingAccount: holdingKeys.publicKey(),
      depositorAccount: swapData.targetAddress,
      distributionAccount: distribution
    });
    const { moveTx } = await swap.buildMoveAssetToHoldingAccountTransaction({
      distributionAccount: distribution,
      holdingAccount: holdingKeys.publicKey(),
      swapSize: new Big(swapData.value).div(10 ** 18).toFixed(7)
    });
    // need to store the refundTx
    await new StellarTransaction()
      .withEventId(swapData.id)
      .withTransactionType(StellarTransactionTypes.Refund)
      .withTransactionEnvelope(refundTx.toEnvelope().toXDR('base64'))
      .save();
    // need to sign and submit the holding tx
    holdingTx.sign(distributionKeypair);
    holdingTx.sign(holdingKeys);
    await server.submitTransaction(holdingTx);
    // need to sign and submit the move tx
    moveTx.sign(distributionKeypair);
    await server.submitTransaction(moveTx);
    // need to return the holdingKeys.publicKey as holdingAddress
    return {
      holdingAddress: holdingKeys.publicKey()
    };
  } catch (error) {
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    throw error;
  }
};

exports.claim = async swapData => {
  try {
    const { preimage, value, holdingAddress } = swapData;
    const swapSize = new Big(value).div(10 ** 18).valueOf();
    const depositorAccount = process.env.STELLAR_SWAPPEE;

    console.log('preimage', preimage);
    console.log('swapSize', swapSize);
    console.log('depositorAccount', depositorAccount);
    console.log('toBuffer', EthereumUtils.toBuffer(preimage));

    const { claimTx } = await swap.buildClaimTransaction({
      preimage: EthereumUtils.toBuffer(preimage),
      depositorAccount,
      holdingAccount: holdingAddress,
      swapSize
    });
    const keypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SWAPPEE_SECRET);
    console.log('claimTx', claimTx);
    claimTx.sign(keypair);
    const transactionResult = await server.submitTransaction(claimTx);
    console.log(transactionResult);
  } catch (error) {
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    throw error;
  }
};
