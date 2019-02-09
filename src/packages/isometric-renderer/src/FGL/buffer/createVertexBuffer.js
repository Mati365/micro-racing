import * as R from 'ramda';

import createBuffer from './createBuffer';

/**
 * Creates OpenGL vertex buffer
 *
 * @param {WebGLRenderingContext} GL
 * @param {Array} vertices
 * @param {GLEnum} usage
 *
 * @returns {Number}
 */
const createVertexBuffer = (gl, vertices, usage = gl.STATIC_DRAW) => createBuffer(
  gl,
  {
    data: new Float32Array(vertices),
    usage,
  },
);

export default R.curryN(2, createVertexBuffer);
