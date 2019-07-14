import COLORS from '../constants/colors';

/**
 * Creates webgl 2D texture
 *
 * @param {WebGLRenderingContext} gl
 * @param {Object} config
 *
 * @returns {GLint}
 */
const texture2D = gl => ({
  image,
  // not required if image provided
  width,
  height,
  color = COLORS.TRANSPARENT, // it should be vec4
}) => {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  if (image) {
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    // try to create texture without image, using color
    if (!width || !height)
      throw new Error('texture2D: Incorrect texture size!');

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, color);
  }

  return tex;
};

export default texture2D;
