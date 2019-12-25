import * as R from 'ramda';

const serializeBsonList = R.map(
  item => item.toListBSON(),
);

export default serializeBsonList;
