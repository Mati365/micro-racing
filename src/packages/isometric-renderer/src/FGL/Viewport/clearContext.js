/**
 * Clears whole viewport
 *
 * @param {WebGLRenderingContext} gl
 */
const clearContext = gl => ({
  depth = 1,
  color = [0.0, 0.0, 0.0, 1.0],
} = {}) => {
  gl.clearColor(...color);
  gl.clearDepth(depth);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

export default clearContext;
