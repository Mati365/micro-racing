import * as R from 'ramda';

/**
 * Creates OpenGL buffer
 *
 * @see
 *  {@link} https://wiki.delphigl.com/index.php/Tutorial_WebGL_Sample
 *  {@link} https://www.khronos.org/opengl/wiki/VBO_-_just_examples
 *
 * @param {WebGLRenderingContext} gl
 * @param {GLEnum} type
 * @param {GLEnum} usage
 * @param {Float32Array|WebGLUnsignedShortArray} data
 *
 * @returns {Number}
 */
const createBuffer = (
  gl,
  {
    type = gl.ARRAY_BUFFER,
    usage = gl.STATIC_DRAW,
    data,
  },
) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, usage);

  return buffer;
};

export default R.curry(createBuffer);
