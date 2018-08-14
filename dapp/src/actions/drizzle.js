export const SET_DRIZZLE = 'SET_DRIZZLE';

export const setDrizzle = (drizzle) => {
  return {
    type: SET_DRIZZLE,
    payload: {
      drizzle
    }
  };
};
