/**
 * Creates OpenGL buffer
 *
 * @see
 *  {@link} https://wiki.delphigl.com/index.php/Tutorial_WebGL_Sample
 *  {@link} https://www.khronos.org/opengl/wiki/VBO_-_just_examples
 *
 * @param {WebGLRenderingContext} GL
 * @param {GLEnum} type
 * @param {GLEnum} mode
 * @param {Float32Array|WebGLUnsignedShortArray} data
 *
 * @returns {Number}
 */
const createBuffer = gl => ({
  type = gl.ARRAY_BUFFER,
  drawMode = gl.STATIC_DRAW,
  data,
}) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, drawMode);

  return buffer;
};

export default createBuffer;
