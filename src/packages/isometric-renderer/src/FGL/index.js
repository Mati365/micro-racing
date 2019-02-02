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
  const gl = element?.getContext('webgl2', {antialias: false});
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

  // it is mutable, save there saved between
  // render calls shared variables, e.g. materialID
  const fglContext = {
    gl,

    // prev is related to draw() meshes calls
    prev: {
      materialUUID: null,
    },
  };

  const bindSceneContext = R.mapObjIndexed(
    R.apply(
      R.__,
      [
        gl,
        fglContext,
      ],
    ),
  );

  return {
    context: fglContext,
    ...bindSceneContext(
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
