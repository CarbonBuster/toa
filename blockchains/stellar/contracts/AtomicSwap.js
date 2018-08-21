const Crypto = require('crypto');
const Stellar = require('stellar-sdk');

const DISTRIBUTION_REFUND_DELAY = 60 * 60;
const BASE_RESERVE = 0.5;

class AtomicSwap {
  constructor(params = {}) {
    let horizonUrl;
    if (params.test) {
      Stellar.Network.useTestNetwork();
      horizonUrl = params.horizonUrl || 'https://horizon-testnet.stellar.org/';
    } else {
      Stellar.Network.usePublicNetwork();
      horizonUrl = params.horizonUrl || 'https://horizon.stellar.org/';
    }
    this.distributionRefundDelay = params.distributionRefundDelay || DISTRIBUTION_REFUND_DELAY;
    this.baseReserve = params.baseReserve || BASE_RESERVE;
    this.dalaAsset = params.dalaAsset;
    this.server = new Stellar.Server(horizonUrl);
  }

  makeHashlock() {
    const preimage = Crypto.randomBytes(32);
    const h = Crypto.createHash('sha256');
    h.update(preimage);
    const hashlock = h.digest();
    return { preimage, hashlock };
  }

  makeHoldingKeys() {
    const holdingKeys = Stellar.Keypair.random();
    return { holdingKeys };
  }

  async buildHoldingAccountTransaction({ hashlock, swapSize, holdingAccount, depositorAccount, distributionAccount }) {
    let distribution = await this.server.loadAccount(distributionAccount);

    distribution.incrementSequenceNumber();
    const minTime = Math.round(new Date().getTime() / 1000) + this.distributionRefundDelay;
    const refundTx = new Stellar.TransactionBuilder(distribution, {
      timebounds: {
        minTime,
        maxTime: 0
      }
    })
      .addOperation(
        Stellar.Operation.accountMerge({
          destination: distributionAccount,
          source: holdingAccount
        })
      )
      .build();

    distribution = await this.server.loadAccount(distributionAccount);
    const holdingTx = new Stellar.TransactionBuilder(distribution)
      .addOperation(
        Stellar.Operation.createAccount({
          destination: holdingAccount,
          startingBalance: 5 * this.baseReserve, // 5 = 2 + signer hashx + signer bob + asset trustline
          source: distributionAccount
        })
      )
      .addOperation(
        Stellar.Operation.changeTrust({
          asset: this.dalaAsset,
          limit: swapSize,
          source: holdingAccount
        })
      )
      .addOperation(
        Stellar.Operation.setOptions({
          signer: {
            ed25519PublicKey: depositorAccount,
            weight: 1
          },
          source: holdingAccount
        })
      )
      .addOperation(
        Stellar.Operation.setOptions({
          signer: {
            sha256Hash: hashlock,
            weight: 1
          },
          source: holdingAccount
        })
      )
      .addOperation(
        Stellar.Operation.setOptions({
          signer: {
            preAuthTx: refundTx.hash(),
            weight: 2
          },
          source: holdingAccount
        })
      )
      .addOperation(
        Stellar.Operation.setOptions({
          masterWeight: 0,
          lowThreshold: 2,
          medThreshold: 2,
          highThreshold: 2,
          source: holdingAccount
        })
      )
      .build();

    return { refundTx, holdingTx };
  }

  async buildMoveAssetToHoldingAccountTransaction({ distributionAccount, holdingAccount, swapSize }) {
    const distribution = await this.server.loadAccount(distributionAccount);
    const moveTx = new Stellar.TransactionBuilder(distribution)
      .addOperation(
        Stellar.Operation.payment({
          asset: this.dalaAsset,
          amount: swapSize,
          destination: holdingAccount,
          source: distributionAccount
        })
      )
      .build();
    return { moveTx };
  }

  async buildClaimTransaction({ preimage, depositorAccount, holdingAccount }) {
    const holding = await this.server.loadAccount(holdingAccount);
    const claimTx = new Stellar.TransactionBuilder(holding)
      .addOperation(
        Stellar.Operation.accountMerge({
          destination: depositorAccount,
          source: holdingAccount
        })
      )
      .build();
    claimTx.signHashX(preimage);
    return { claimTx };
  }
}

module.exports = AtomicSwap;