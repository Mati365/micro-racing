/**
 * Creates object of flags used in engine,
 * it is only user mode flags - whole engine
 * should operate on WebGL flags due to performance
 * issues using map
 *
 * @param {WebGLRenderingContext} gl
 * @returns {Object}
 */
const createContextFlags = gl => ({
  // VBO drawMode flags
  POINTS: gl.POINTS,
  LINES: gl.LINES,
  LINE_STRIP: gl.LINE_STRIP,
  LINE_LOOP: gl.LINE_LOOP,
  TRIANGLES: gl.TRIANGLES,
  TRIANGLE_STRIP: gl.TRIANGLE_STRIP,
  TRIANGLE_FAN: gl.TRIANGLE_FAN,
});

export default createContextFlags;
