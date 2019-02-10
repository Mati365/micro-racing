/**
 * Get opengl context from element
 *
 * @param {HTMLElement} element
 * @return {WebGLRenderingContext}
 */
const getElementWebGLContext = (element) => {
  const gl = element?.getContext('webgl2', {antialias: false});
  if (!gl)
    throw new Error('WebGL2 context is null! Scene cannot be initialized!');

  return gl;
};

/**
 * Clears whole viewport
 *
 * @param {WebGLRenderingContext} gl
 *
 * @returns {WebGLRenderingContext}
 */
const pickGlContext = element => ({
  depth = 1,
  color = [0.0, 0.0, 0.0, 1.0],
} = {}) => {
  const gl = getElementWebGLContext(element);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  gl.clearColor(...color);
  gl.clearDepth(depth);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  return gl;
};

export default pickGlContext;
