const rotate = (vec, matrix, destMatrix = matrix) => {
  const {array: dest} = destMatrix;
  const {array: src} = matrix;

  const [x, y, z] = vec;

  if (x === 0 && y === 0 && z === 0)
    return destMatrix;

  const cosX = Math.cos(x), sinX = Math.sin(x);
  const cosY = Math.cos(y), sinY = Math.sin(y);
  const cosZ = Math.cos(z), sinZ = Math.sin(z);

  // first row
  const a0 = cosZ * cosY;
  const a1 = -cosX * sinZ + sinX * sinY * cosZ;
  const a2 = sinX * sinZ + cosX * sinY * cosZ;

  // second row
  const a4 = cosY * sinZ;
  const a5 = cosX * cosZ + sinX * sinY * sinZ;
  const a6 = -sinX * cosZ + cosX * sinY * sinZ;

  // third row
  const a8 = -sinY;
  const a9 = sinX * cosY;
  const a10 = cosX * cosY;

  const
    b0 = src[0], b1 = src[1], b2 = src[2], b3 = src[3],
    b4 = src[4], b5 = src[5], b6 = src[6], b7 = src[7],
    b8 = src[8], b9 = src[9], b10 = src[10], b11 = src[11];

  if (matrix !== destMatrix) {
    /* eslint-disable prefer-destructuring */
    dest[15] = src[15];
    dest[14] = src[14];
    dest[13] = src[13];
    dest[12] = src[12];
    /* eslint-enable prefer-destructuring */
  }

  dest[11] = (a10 * b11) + (a9 * b7) + (a8 * b3);
  dest[10] = (a10 * b10) + (a9 * b6) + (a8 * b2);
  dest[9] = (a10 * b9) + (a9 * b5) + (a8 * b1);
  dest[8] = (a10 * b8) + (a9 * b4) + (a8 * b0);
  dest[7] = (a6 * b11) + (a5 * b7) + (a4 * b3);
  dest[6] = (a6 * b10) + (a5 * b6) + (a4 * b2);
  dest[5] = (a6 * b9) + (a5 * b5) + (a4 * b1);
  dest[4] = (a6 * b8) + (a5 * b4) + (a4 * b0);
  dest[3] = (a2 * b11) + (a1 * b7) + (a0 * b3);
  dest[2] = (a2 * b10) + (a1 * b6) + (a0 * b2);
  dest[1] = (a2 * b9) + (a1 * b5) + (a0 * b1);
  dest[0] = (a2 * b8) + (a1 * b4) + (a0 * b0);

  return destMatrix;
};

export default rotate;
