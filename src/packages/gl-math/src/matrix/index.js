import create from './createMatrix';

export * from './operations';
export {
  create,
};

export const create3x3 = m => create(3, 3, m);
export const create4x4 = m => create(4, 4, m);
