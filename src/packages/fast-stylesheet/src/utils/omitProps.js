const omitProps = (keys, obj) => {
  const clone = Object.assign({}, obj);
  keys.forEach((key) => {
    delete clone[key];
  });

  return clone;
};

export default omitProps;
