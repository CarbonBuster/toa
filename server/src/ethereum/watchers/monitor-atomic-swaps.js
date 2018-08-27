const EventWatcher = require('./EventWatcher');

const rpcUrl = process.env.ETHEREUM_RPC_URL;
const contractAddress = process.env.ETHEREUM_ATOMIC_SWAP_ADDRESS;
const watcher = new EventWatcher({ rpcUrl, contractAddress });

const Events = ['Open', 'Expire', 'Close', 'Accept', 'Prepare'];

const watchers = Events.map(event => watcher.watch(event));

Promise.all(watchers);