export const SET_ETHER_BALANCE = 'SET_ETHER_BALANCE';
export const SET_DALA_BALANCE = 'SET_DALA_BALANCE';
export const SET_LOADED = 'SET_LOADED';
export const OPEN_SWAP = 'ETHEREUM_OPEN_SWAP';
export const GET_SWAP = 'ETHEREUM_GET_SWAP';

export function setEtherBalance(balance) {
  return {
    type: SET_ETHER_BALANCE,
    payload: {
      balance
    }
  };
}

export function setDalaBalance(balance) {
  return {
    type: SET_DALA_BALANCE,
    payload: {
      balance
    }
  };
}

export function setLoaded(isLoaded) {
  return {
    type: SET_LOADED,
    payload: {
      isLoaded
    }
  };
}

export function getSwap(id) {
  return {
    type: GET_SWAP,
    payload: { id }
  };
}

export function openSwap(payload) {
  return {
    type: OPEN_SWAP,
    payload
  };
}
