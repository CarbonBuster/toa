export const CLAIM = 'STELLAR_CLAIM;';
export const SET_LUMEN_BALANCE = 'STELLAR_SET_LUMEN_BALANCE';
export const SET_DALA_BALANCE = 'STELLAR_SET_DALA_BALANCE';
export const SET_LOADED = 'STELLAR_SET_LOADED';
export const OPEN_SWAP = 'STELLAR_OPEN_SWAP';
export const LOAD_ACCOUNT = 'STELLAR_LOAD_ACCOUNT';

export function claim(swapId, secret) {
  return {
    type: CLAIM,
    payload: { swapId, secret }
  };
}

export function setLumenBalance(balance) {
  return {
    type: SET_LUMEN_BALANCE,
    payload: { balance }
  };
}

export function setDalaBalance(balance) {
  return {
    type: SET_DALA_BALANCE,
    payload: { balance }
  };
}

export function setLoaded(isLoaded) {
  return {
    type: SET_LOADED,
    payload: { isLoaded }
  };
}

export function openSwap(payload) {
  return {
    type: OPEN_SWAP,
    payload
  };
}

export function loadAccount(publicKey){
  return {
    type: LOAD_ACCOUNT,
    payload: {publicKey}
  }
}