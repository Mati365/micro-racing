import * as R from 'ramda';

import createDtRenderLoop from './createDtRenderLoop';
import createMatrial from './material/createMaterial';

import createMesh from './mesh/createMesh';
import {
  meshes,
  materials,
} from './predefined';

import clearContext from './viewport/clearContext';
import createFGLState from './createFGLState';

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

  // see: it is mutable
  const state = createFGLState(gl);
  const fgl = {};

  const bindSceneContext = R.flip(R.apply)([gl, fgl]);
  const bindObjectSceneContext = R.mapObjIndexed(bindSceneContext);

  // Object.assign due to shared fglContext between callers
  Object.assign(
    fgl,
    {
      // shared between engine flags
      state,
      flags: state.flags,

      // creators
      ...bindObjectSceneContext(
        {
          frame: createDtRenderLoop,
          material: createMatrial,
          clear: clearContext,
          mesh: createMesh,
        },
      ),
    },
  );

  // assign predefined meshes / materials
  R.forEachObjIndexed(
    (fn, meshName) => {
      fgl.mesh[meshName] = fn(fgl);
    },
    meshes,
  );

  R.forEachObjIndexed(
    (fn, materialName) => {
      fgl.material[materialName] = fn(fgl);
    },
    materials,
  );

  return fgl;
};

export default createRenderContext;
