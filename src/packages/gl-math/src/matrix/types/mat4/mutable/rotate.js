const rotate = (vec, matrix) => {
  const {array: dest} = matrix;
  const [x, y, z] = vec;

  if (x === 0 && y === 0 && z === 0)
    return matrix;

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
    b0 = dest[0], b1 = dest[1], b2 = dest[2], b3 = dest[3],
    b4 = dest[4], b5 = dest[5], b6 = dest[6], b7 = dest[7],
    b8 = dest[8], b9 = dest[9], b10 = dest[10], b11 = dest[11];

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
  return matrix;
};

export default rotate;
