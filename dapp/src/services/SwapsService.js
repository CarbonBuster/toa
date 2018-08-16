import LocalStorageDb from 'localstoragedb/localstoragedb';
const db = new LocalStorageDb('toa', localStorage);

function createTableIfNotExists() {
  if (!db.tableExists('swaps')) {
    db.createTable('swaps', ['id', 'chain', 'amount', 'hashlock', 'preimage', 'xAddress', 'timelock', 'transaction']);
  }
}

export async function getSwaps() {
  createTableIfNotExists();
  return db.queryAll('swaps');
}

export async function addSwap(swap) {
  createTableIfNotExists();
  db.insertOrUpdate('swaps', { id: swap.id }, swap);
  db.commit();
}
