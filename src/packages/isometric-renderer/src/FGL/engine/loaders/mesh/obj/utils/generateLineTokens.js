import * as R from 'ramda';

const generateLineTokens = R.compose(
  R.map(
    R.split(' '),
  ),
  R.split('\n'),
);

export default generateLineTokens;
