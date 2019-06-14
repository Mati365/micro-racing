const translate = (vec, matrix, destMatrix = matrix) => {
  const {array: dest} = matrix;
  const {array: src} = destMatrix;

  const a3 = vec[0], a7 = vec[1], a11 = vec[2];

  const
    b0 = src[0], b1 = src[1], b2 = src[2], b3 = src[3],
    b4 = src[4], b5 = src[5], b6 = src[6], b7 = src[7],
    b8 = src[8], b9 = src[9], b10 = src[10], b11 = src[11],
    b12 = src[12], b13 = src[13], b14 = src[14], b15 = src[15];

  if (matrix !== destMatrix) {
    /* eslint-disable prefer-destructuring */
    dest[15] = src[15];
    dest[14] = src[14];
    dest[13] = src[13];
    dest[12] = src[12];
    /* eslint-enable prefer-destructuring */
  }

  dest[11] = (a11 * b15) + b11;
  dest[10] = (a11 * b14) + b10;
  dest[9] = (a11 * b13) + b9;
  dest[8] = (a11 * b12) + b8;
  dest[7] = (a7 * b15) + b7;
  dest[6] = (a7 * b14) + b6;
  dest[5] = (a7 * b13) + b5;
  dest[4] = (a7 * b12) + b4;
  dest[3] = (a3 * b15) + b3;
  dest[2] = (a3 * b14) + b2;
  dest[1] = (a3 * b13) + b1;
  dest[0] = (a3 * b12) + b0;

  return destMatrix;
};

export default translate;
