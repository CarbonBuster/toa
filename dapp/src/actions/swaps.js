export const GET_SWAPS = 'GET_SWAPS';
export const SET_SWAPS = 'SET_SWAPS';
export const ADD_SWAP = 'ADD_SWAP';
export const GET_SWAP = 'GET_SWAP';
export const SET_SELECTED_SWAP = 'SET_SELECTED_SWAP';
export const UPDATE_SWAP = 'UPDATE_SWAP';
export const SWAP_UPDATED = 'SWAP_UPDATED';

export function getSwap(id) {
  return {
    type: GET_SWAP,
    payload: { id }
  };
}

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

export function setSelectedSwap(swap) {
  return {
    type: SET_SELECTED_SWAP,
    payload: { swap }
  };
}

export function updateSwap(swap) {
  return {
    type: UPDATE_SWAP,
    payload: { swap }
  };
}

export function swapUpdated(id){
  return {
    type: SWAP_UPDATED,
    payload: {id}
  }
}
