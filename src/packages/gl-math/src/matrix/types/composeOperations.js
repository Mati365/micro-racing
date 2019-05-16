/**
 * It is faster than array

 * @param {Function} operationFn
 */
const composeOperations = operationFn => (m1, m2, m3, m4, m5) => {
  let dest = m1;

  if (m2) {
    dest = operationFn(m2, dest, dest);

    if (m3) {
      dest = operationFn(m3, dest, dest);

      if (m4) {
        dest = operationFn(m4, dest, dest);

        if (m5)
          dest = operationFn(m5, dest, dest);
      }
    }
  }

  return dest;
};

export default composeOperations;
