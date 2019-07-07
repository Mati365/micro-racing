import * as R from 'ramda';

import createBuffer from '../createBuffer';

/**
 * Creates OpenGL vertex buffer
 *
 * @see
 *  It can work as UV buffer!
 *  Number of vertices in each cell might be different
 *
 * @param {WebGLRenderingContext} GL
 * @param {Array} vertices
 * @param {GLEnum} usage
 * @param {Number} prefferedSingleVertexLength
 * @param {Number} vertexAttribDivisor
 *
 * @returns {BufferDescriptor}
 */
const createVertexBuffer = (
  gl,
  vertices,
  usage = gl.STATIC_DRAW,
  prefferedSingleVertexLength = null,
  vertexAttribDivisor = null,
) => {
  if (!vertices || !vertices.length)
    throw new Error('createVertexBuffer: not vertices provided!');

  const singleVertexLength = vertices[0].length || prefferedSingleVertexLength;

  // validators
  if (!singleVertexLength)
    throw new Error('createVertexBuffer: single vertex cannot be 0 dimensional!');

  if (!R.isNil(prefferedSingleVertexLength) && prefferedSingleVertexLength !== singleVertexLength)
    throw new Error(`createVertexBuffer: incorrect singleVertexLength(${singleVertexLength}), it should be equal ${prefferedSingleVertexLength}`);

  // create buffer
  const data = new Float32Array(R.unnest(vertices));
  const bufferWrapper = createBuffer(
    gl,
    {
      data,
      usage,
    },
  );

  Object.assign(
    bufferWrapper,
    {
      vertexAttribDivisor,

      // used to bind buffer
      // todo: add more basic buffer creator?
      components: {
        type: gl.FLOAT,
        singleLength: singleVertexLength,
        count: vertices.length,
      },
    },
  );

  return bufferWrapper;
};

export default R.curryN(2, createVertexBuffer);
