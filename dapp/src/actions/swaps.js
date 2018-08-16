export const GET_SWAPS = 'GET_SWAPS';
export const SET_SWAPS = 'SET_SWAPS';
export const ADD_SWAP = 'ADD_SWAP';

export function getSwaps() {
  return {
    type: GET_SWAPS
  };
}

export function setSwaps(swaps) {
  return {
    type: SET_SWAPS,
    payload: { swaps }
  };
}

export function addSwap(swap) {
  return {
    type: ADD_SWAP,
    payload: { swap }
  };
}
