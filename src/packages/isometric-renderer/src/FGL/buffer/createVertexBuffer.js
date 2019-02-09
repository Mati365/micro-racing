import * as R from 'ramda';

import createBuffer from './createBuffer';

/**
 * Creates OpenGL vertex buffer
 *
 * @param {WebGLRenderingContext} GL
 * @param {Array} vertices
 * @param {GLEnum} usage
 *
 * @returns {BufferDescriptor}
 */
const createVertexBuffer = (gl, vertices, usage = gl.STATIC_DRAW) => {
  if (!vertices || !vertices.length)
    throw new Error('createVertexBuffer: not vertices provided!');

  const singleVertexLength = vertices[0].length;
  if (!singleVertexLength)
    throw new Error('createVertexBuffer: single vertex cannot be 0 dimensional!');

  const data = new Float32Array(R.unnest(vertices));
  return {
    // used to bind buffer
    // todo: add more basic buffer creator?
    components: {
      type: gl.FLOAT,
      singleLength: singleVertexLength,
      count: vertices.length,
    },

    ...createBuffer(
      gl,
      {
        data,
        usage,
      },
    ),
  };
};

export default R.curryN(2, createVertexBuffer);
