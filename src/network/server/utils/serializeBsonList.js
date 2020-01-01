import * as R from 'ramda';

const serializeBsonList = R.map(
  (item) => {
    if (!item.toListBSON)
      return item.toBSON();

    return item.toListBSON();
  },
);

export default serializeBsonList;
