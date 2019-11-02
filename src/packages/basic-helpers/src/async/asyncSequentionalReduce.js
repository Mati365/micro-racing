const asyncSequentionalReduce = (reducerFn, initialValue, array) => array.reduce(
  async (acc, item, index) => reducerFn(await acc, item, index),
  initialValue,
  array,
);

export default asyncSequentionalReduce;
