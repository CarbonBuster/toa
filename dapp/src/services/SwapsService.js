import LocalStorageDb from 'localstoragedb/localstoragedb';
const db = new LocalStorageDb('toa', localStorage);

function createTableIfNotExists() {
  if (!db.tableExists('swaps')) {
    db.createTable('swaps', [
      'id',
      'sourceChain',
      'targetChain',
      'amount',
      'hashlock',
      'preimage',
      'targetAddress',
      'holdingAddress',
      'timelock',
      'transaction',
      'status'
    ]);
  }
}

export async function getSwaps() {
  createTableIfNotExists();
  return db.queryAll('swaps');
}

export async function getSwap(id) {
  createTableIfNotExists();
  let swaps = db.queryAll('swaps', {
    query: { id }
  });
  return swaps.length && swaps[0];
}

export async function addSwap(swap) {
  createTableIfNotExists();
  db.insertOrUpdate('swaps', { id: swap.id }, swap);
  db.commit();
}

export async function updateSwap(swap) {
  createTableIfNotExists();
  db.update('swaps', { id: swap.id }, row => {
    let updated = {
      ...row,
      ...swap
    };
    console.log('updated values', updated);
    return updated;
  });
  db.commit();
}
