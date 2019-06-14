const scale = (vec, matrix) => {
  const {array: dest} = matrix;
  const a0 = vec[0], a5 = vec[1], a10 = vec[2], a15 = 1.0;

  const
    b0 = dest[0], b1 = dest[1], b2 = dest[2], b3 = dest[3],
    b4 = dest[4], b5 = dest[5], b6 = dest[6], b7 = dest[7],
    b8 = dest[8], b9 = dest[9], b10 = dest[10], b11 = dest[11],
    b12 = dest[12], b13 = dest[13], b14 = dest[14], b15 = dest[15];

  dest[15] = a15 * b15;
  dest[14] = a15 * b14;
  dest[13] = a15 * b13;
  dest[12] = a15 * b12;
  dest[11] = a10 * b11;
  dest[10] = a10 * b10;
  dest[9] = a10 * b9;
  dest[8] = a10 * b8;
  dest[7] = a5 * b7;
  dest[6] = a5 * b6;
  dest[5] = a5 * b5;
  dest[4] = a5 * b4;
  dest[3] = a0 * b3;
  dest[2] = a0 * b2;
  dest[1] = a0 * b1;
  dest[0] = a0 * b0;

  return matrix;
};

export default scale;
