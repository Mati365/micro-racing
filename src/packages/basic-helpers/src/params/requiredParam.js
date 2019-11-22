const requiredParam = (name) => {
  throw new Error(`Missing required param ${name}!`);
};

export default requiredParam;
