import * as R from 'ramda';

import createBuffer from './createBuffer';

/**
 * Creates OpenGL indices buffer
 *
 * @param {WebGLRenderingContext} GL
 * @param {Array} indices
 * @param {GLEnum} drawMode
 *
 * @returns {Number}
 */
const createIndexBuffer = (gl, indices, drawMode = gl.STATIC_DRAW) => createBuffer(
  gl,
  {
    type: gl.ELEMENT_ARRAY_BUFFER,
    data: new Uint16Array(indices),
    drawMode,
  },
);

export default R.curryN(2, createIndexBuffer);
