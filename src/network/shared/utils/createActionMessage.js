const createActionMessage = (actionCode, data) => {
  const {byteLength: len} = data;
  const tmp = new Uint8Array(1 + len);

  tmp.set([actionCode], 0);
  tmp.set(new Uint8Array(data), 1);
  return tmp;
};

export default createActionMessage;
