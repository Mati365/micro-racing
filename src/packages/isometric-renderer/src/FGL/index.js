import * as R from 'ramda';

import createMatrial from './material/createMaterial';
import createMesh from './mesh/createMesh';
import {
  meshes,
  materials,
} from './predefined';

import createFGLState from './createFGLState';
import {
  pickGlContext,
  createDtRenderLoop,
} from './viewport';

/**
 * Create global engine context
 *
 * @param {HTMLElement} canvasHandle
 * @param {Object} glContextFlags
 *
 * @return {FGLContext}
 */
const createRenderContext = (canvasElement, glContextFlags) => {
  const gl = pickGlContext(canvasElement)(glContextFlags);

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
