export const SET_SELECTED_CHAIN = 'SET_SELECTED_CHAIN';

export const setSelectedChain = chain => {
  console.log('chains.setSelectedChain', chain);
  return {
    type: SET_SELECTED_CHAIN,
    payload: {
      chain
    }
  };
};
