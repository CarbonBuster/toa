const StellarSdk = require('stellar-sdk');
let horizonUrl = process.env.REACT_APP_STELLAR_HORIZON_URL;
if (process.env.REACT_APP_STELLAR_IS_TEST) {
  StellarSdk.Network.useTestNetwork();
  horizonUrl = horizonUrl || 'https://horizon-testnet.stellar.org';
} else {
  StellarSdk.Network.usePublicNetwork();
  horizonUrl = horizonUrl || 'https://horizon.stellar.org';
}
const server = new StellarSdk.Server(horizonUrl);

export default server;