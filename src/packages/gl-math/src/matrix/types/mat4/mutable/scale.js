const scale = (vec, matrix, destMatrix = matrix) => {
  const {array: dest} = destMatrix;
  const {array: src} = matrix;

  const a0 = vec[0], a5 = vec[1], a10 = vec[2], a15 = 1.0;

  const
    b0 = src[0], b1 = src[1], b2 = src[2], b3 = src[3],
    b4 = src[4], b5 = src[5], b6 = src[6], b7 = src[7],
    b8 = src[8], b9 = src[9], b10 = src[10], b11 = src[11],
    b12 = src[12], b13 = src[13], b14 = src[14], b15 = src[15];

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

  return destMatrix;
};

export default scale;
