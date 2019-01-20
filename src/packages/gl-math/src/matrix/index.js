import create from './createMatrix';
import dump from './dumpMatrix';
import * as creators from './creators';

export * from './operations';

export const from = creators;

export {
  create,
  dump,
};
