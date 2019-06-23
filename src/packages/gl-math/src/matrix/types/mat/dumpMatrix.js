import * as R from 'ramda';

export const toStringMatrix = ({array, w}) => R.compose(
  R.join('\n'),
  R.map(
    R.join(', '),
  ),
  R.splitEvery(w),
)(array);

export default R.compose(
  ::console.log,
  toStringMatrix,
);
