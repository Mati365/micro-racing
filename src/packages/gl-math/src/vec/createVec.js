import createMatrix from '../matrix/createMatrix';

/**
 * Creates vector with provided size
 *
 * @param {Number} w
 * @param {Number[]} m
 *
 * @returns {Matrix}
 */
const createVec = (w, m) => createMatrix(w, 1, m);

export default createVec;
