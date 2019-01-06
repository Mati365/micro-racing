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
  array: new Float32Array(
    m || (w * h),
  ),
  w,
  h,
});

export default createMatrix;
