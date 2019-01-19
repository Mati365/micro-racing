import * as R from 'ramda';

const timesToString = R.compose(
  R.join(''),
  R.times,
);

export default timesToString;
