const StellarSdk = require('stellar-sdk');
let horizonUrl = process.env.STELLAR_HORIZON_URL;
if (process.env.STELLAR_IS_TEST) {
  StellarSdk.Network.useTestNetwork();
  horizonUrl = horizonUrl || 'https://horizon-testnet.stellar.org/';
} else {
  StellarSdk.Network.usePublicNetwork();
  horizonUrl = horizonUrl || 'https://horizon.stellar.org/';
}
this.server = new StellarSdk.Server(horizonUrl);

module.exports = server;
