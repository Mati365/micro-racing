/**
 * Creates webgl 2D texture
 *
 * @param {WebGLRenderingContext} gl
 *
 * @returns {GLint}
 */
const createTexture2D = gl => (image) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);

  return texture;
};

export default createTexture2D;
