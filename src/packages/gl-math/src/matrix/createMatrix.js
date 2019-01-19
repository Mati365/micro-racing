/**
 * Creates matrix with Float32Array with given size
 *
 * @param {Number} w
 * @param {Number} h
 * @param {Number|Number[]} m
 *
 * @returns {Matrix}
 */
const createMatrix = (w, h, m) => ({
  array: m || new Float32Array(w * h),
  w,
  h,
});

/**
 * Creates vector matrix
 *
 * @param {Number} w
 * @param {Number|Number[]} m
 */
export const createVector = (w, m) => createMatrix(w, 1, m);

export default createMatrix;
