const createCounter = (prefix = 0, initialValue = 0) => {
  let id = initialValue;

  const counterFn = () => prefix + ++id;

  counterFn.prefix = prefix;

  counterFn.getValue = () => id;
  counterFn.setValue = (value) => {
    id = value;
  };

  return counterFn;
};

export default createCounter;
