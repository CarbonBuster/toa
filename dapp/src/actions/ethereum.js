export const SET_ETHER_BALANCE = 'ETHEREUM_SET_SET_ETHER_BALANCE';
export const SET_DALA_BALANCE = 'ETHEREUM_SET_SET_DALA_BALANCE';
export const SET_LOADED = 'ETHEREUM_SET_LOADED';
export const CLAIM = 'ETHEREUM_CLAIM';
export const OPEN_SWAP = 'ETHEREUM_OPEN_SWAP';
export const GET_SWAP = 'ETHEREUM_GET_SWAP';
export const PREPARE_SWAP = 'ETHEREUM_PREPARE_SWAP';
export const SET_ADDRESS = 'ETHEREUM_SET_ADDRESS';
export const SET_NETWORK = 'ETHEREUM_SET_NETWORK';

export function setAddress(address) {
  return {
    type: SET_ADDRESS,
    payload: { address }
  };
}

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

export function prepareSwap(id) {
  return {
    type: PREPARE_SWAP,
    payload: { id }
  };
}

export function claim(swapId) {
  return {
    type: CLAIM,
    payload: { swapId }
  };
}

export function setNetwork(network) {
  return {
    type: SET_NETWORK,
    payload: { network }
  };
}
