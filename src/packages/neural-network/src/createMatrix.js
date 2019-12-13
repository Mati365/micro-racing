import * as R from 'ramda';

const createMatrix = (width, height, fillFn = R.always(0)) => R.times(
  () => R.times(
    fillFn,
    height,
  ),
  width,
);

export default createMatrix;
