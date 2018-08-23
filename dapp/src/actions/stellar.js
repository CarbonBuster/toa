export const CLAIM = 'STELLAR_CLAIM;';

export function claim(swapId, secret) {
  return {
    type: CLAIM,
    payload: { swapId, secret }
  };
}
