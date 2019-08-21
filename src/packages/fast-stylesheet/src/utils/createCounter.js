const createCounter = (prefix = 0) => {
  let id = 0;
  return () => prefix + ++id;
};

export default createCounter;
