import asyncSequentionalReduce from './asyncSequentionalReduce';

const asyncSequentionalMap = (fn, array) => asyncSequentionalReduce(
  async (acc, item, index) => {
    acc.push(await fn(item, index));
    return acc;
  },
  [],
  array,
);

export default asyncSequentionalMap;
