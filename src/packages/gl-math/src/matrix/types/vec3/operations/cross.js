import Vector from '../../../../classes/Vector';

/**
 * Performs cross operation of two vectors
 *
 * @param {Vector} vec1
 * @param {Vector} vec2
 *
 * @returns {Vector}
 */
const cross = (vec1, vec2) => {
  const ax = vec1[0], ay = vec1[1], az = vec1[2];
  const bx = vec2[0], by = vec2[1], bz = vec2[2];

  return new Vector([
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx,
  ]);
};

export default cross;
