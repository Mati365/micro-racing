import * as R from 'ramda';

import createBuffer from '../createBuffer';

/**
 * Creates OpenGL indices buffer
 *
 * @param {WebGLRenderingContext} GL
 * @param {Array} indices
 * @param {GLEnum} usage
 *
 * @returns {Number}
 */
const createIndexBuffer = (gl, indices, usage = gl.STATIC_DRAW) => ({
  components: {
    type: gl.UNSIGNED_SHORT,
    singleLength: 1,
    count: indices.length,
  },

  ...createBuffer(
    gl,
    {
      type: gl.ELEMENT_ARRAY_BUFFER,
      data: new Uint16Array(indices),
      usage,
    },
  ),
});

export default R.curryN(2, createIndexBuffer);
