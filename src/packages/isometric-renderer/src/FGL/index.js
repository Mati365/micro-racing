import createDtRenderLoop from './createDtRenderLoop';
import createMatrial from './Material/createMaterial';

import clearContext from './Viewport/clearContext';

/**
 * Get opengl context from element
 *
 * @param {HTMLElement} element
 * @return {WebGLRenderingContext}
 */
const getElementWebGLContext = (element) => {
  const gl = element?.getContext('webgl2');
  if (!gl)
    throw new Error('WebGL2 context is null! Scene cannot be initialized!');

  return gl;
};

/**
 * Create global engine context
 *
 * @param {HTMLElement} canvasHandle
 * @return {FGLContext}
 */
const createRenderContext = (canvasElement) => {
  const gl = getElementWebGLContext(canvasElement);
  const state = Object.freeze(
    {
      gl,
    },
  );

  return {
    ...state,
    frame: createDtRenderLoop(state),
    material: createMatrial(gl),
    clear: clearContext(gl),
  };
};

export default createRenderContext;
