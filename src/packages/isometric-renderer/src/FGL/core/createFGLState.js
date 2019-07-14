import getDOMElementSize from '@pkg/basic-helpers/base/getDOMElementSize';
import createContextFlags from './constants/createContextFlags';

import COLORS from './constants/colors';

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
 * @returns {FGLState}
 */
const createFGLState = gl => ({
  flags: createContextFlags(gl),
  colors: COLORS,

  canvas: gl.canvas,
  canvasDimensions: getDOMElementSize(gl.canvas),

  gl,

  // cache utils
  materialUUID: null,
});

export default createFGLState;
