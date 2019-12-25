import * as R from 'ramda';

const capitalize = R.compose(
  R.replace(/^./, R.toUpper),
  R.toLower,
);

export default capitalize;
