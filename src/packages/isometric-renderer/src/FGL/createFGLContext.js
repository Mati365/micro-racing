/**
 * Creates blank shared between engine functions context.
 *
 * @see
 *  It is mutable object! Every function of engine can override
 *  it, due to performance issues in JS world context allow engine
 *  to manage cache etc
 *
 * @param {WebGLRenderingContext} gl
 *
 * @returns {FGLContext}
 */
const createFGLContext = gl => ({
  materialUUID: null,
  gl,
});

export default createFGLContext;
