export const GET_WEB3 = 'GET_WEB3';
export const SET_WEB3 = 'SET_WEB3';

export const getWeb3 = () => {
  return {
    type: GET_WEB3,
    payload: {}
  };
};

export const setWeb3 = (web3) => {
  return {
    type: SET_WEB3,
    payload: { web3 }
  };
};
