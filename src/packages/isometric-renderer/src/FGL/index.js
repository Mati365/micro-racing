import * as R from 'ramda';

import createDtRenderLoop from './createDtRenderLoop';
import createMatrial from './Material/createMaterial';
import createMesh from './Mesh/createMesh';

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
  const bindGLContext = R.mapObjIndexed(R.applyTo(gl));

  const state = Object.freeze(
    {
      gl,
    },
  );

  return {
    ...state,
    ...bindGLContext(
      {
        frame: createDtRenderLoop,
        material: createMatrial,
        clear: clearContext,
        mesh: createMesh,
      },
    ),
  };
};

export default createRenderContext;
