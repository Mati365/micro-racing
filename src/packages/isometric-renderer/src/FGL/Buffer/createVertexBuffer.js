import * as R from 'ramda';

import createBuffer from './createBuffer';

/**
 * Creates OpenGL vertex buffer
 *
 * @param {WebGLRenderingContext} GL
 * @param {Array} vertices
 * @param {GLEnum} drawMode
 *
 * @returns {Number}
 */
const createVertexBuffer = (gl, vertices, drawMode = gl.STATIC_DRAW) => createBuffer(
  gl,
  {
    data: new Float32Array(vertices),
    drawMode,
  },
);

export default R.curryN(2, createVertexBuffer);
