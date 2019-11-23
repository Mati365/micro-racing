import * as R from 'ramda';

// CORE
import COLORS from './core/constants/colors';

import {createShaderMaterial} from './core/material/types';
import texture2D from './core/texture/texture2D';
import tileTexture2D from './core/texture/tileTexture2D';

import appendCanvasHTMLNode from './core/appendCanvasHTMLNode';
import createMesh from './core/mesh/createMesh';
import createMeshBatch from './core/mesh/createMeshBatch';
import createFGLState from './core/createFGLState';
import {
  pickGlContext,
  createDtRenderLoop,
} from './core/viewport';

// ENGINE
import * as meshLoaders from './engine/loaders/mesh';

import getMaterialMeshFrom, {getCachedMaterialMeshFrom} from './engine/loaders/mesh/utils/getMaterialMeshFrom';
import createSceneBuffer from './engine/scene/createSceneBuffer';

import {
  meshes,
  materials,
} from './engine';

export {
  COLORS,
};

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

  // attaches GL / FGL global state to each function
  const bindSceneContext = R.flip(R.apply)([gl, fgl]);
  const bindObjectSceneContext = R.mapObjIndexed(
    R.when(
      R.is(Function),
      bindSceneContext,
    ),
  );

  // creates based on mesh data mesh renderer with FBO
  const meshFrom = getMaterialMeshFrom(fgl, gl);
  Object.assign(
    meshFrom,
    {
      cached: getCachedMaterialMeshFrom(fgl, gl),
    },
  );

  // Object.assign due to shared fglContext between callers
  Object.assign(
    fgl,
    {
      // shared between engine flags
      state,
      loaders: {
        mesh: {
          ...meshLoaders,
          from: meshFrom,
        },
      },

      // HTML helpers
      appendCanvasHTMLNode: appendCanvasHTMLNode(canvasElement),

      // non related creators
      createSceneBuffer: R.partial(createSceneBuffer, [fgl]),

      // pick shared constants
      ...R.pick(
        ['flags', 'colors'],
        state,
      ),

      // creators
      ...bindObjectSceneContext(
        {
          frame: createDtRenderLoop,
          mesh: createMesh,
          texture2D,
          tileTexture2D,
        },
      ),

      // different material types, for solid color material
      // will be slightly different
      material: bindObjectSceneContext(
        {
          shader: createShaderMaterial,
        },
      ),
    },
  );

  // batch multiple mesh renders calls into one
  fgl.mesh.batch = bindSceneContext(createMeshBatch);

  // assign predefined meshes / materials
  R.forEachObjIndexed(
    (fn, meshName) => {
      fgl.mesh[meshName] = fn(fgl, gl);
    },
    meshes,
  );

  R.forEachObjIndexed(
    (fn, materialName) => {
      fgl.material[materialName] = fn(fgl, gl);
    },
    materials,
  );

  return fgl;
};

export default createRenderContext;
