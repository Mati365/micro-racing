import * as R from 'ramda';

import {createUBO, createMeshVertexBuffer} from '../../../../core/buffer/types';
import {packMaterialsBuffer} from '../../../materials/createMaterialMeshMaterial';
import MeshVertexResource from '../types/MeshVertexResource';

const getMaterialMeshFrom = (f, gl) => async (
  {
    loader = 'obj',
    loaderData,
    textures = [],
    uniforms,
    ubo,
    ...params
  },
) => {
  const meshVertexData = (
    R.is(MeshVertexResource, loaderData)
      ? loaderData
      : f.loaders.mesh[loader](loaderData)
  );

  const {
    size,
    materials,
    normalized,
    vertices,
    textures: loaderTextures,
    vao = createMeshVertexBuffer(gl, vertices, normalized),
  } = meshVertexData;

  const shaderTextures = R.map(
    R.compose(
      f.texture2D,
      R.objOf('image'),
    ),
    [
      ...loaderTextures,
      ...textures,
    ],
  );

  return f.mesh(
    {
      size,
      renderMode: f.flags.TRIANGLES,
      material: f.material.materialMesh,
      textures: shaderTextures,
      uniforms: {
        textured: !R.isEmpty(shaderTextures),
        opacity: 1.0,
        ...uniforms,
      },
      ubo: {
        materialsBlock: createUBO(
          gl,
          {
            data: packMaterialsBuffer(materials),
          },
        ),
        ...ubo,
      },
      vao,
      ...params,
    },
  );
};

/**
 * Creates cached mesh creator
 *
 * @param {FGL} f
 * @param {WebGLRenderingContext} gl

 * @param {{key, resolver}} config
 *
 * @returns MeshRenderer
 */
export const getCachedMaterialMeshFrom = (f, gl) => {
  const createMesh = getMaterialMeshFrom(f, gl);

  return R.memoizeWith(
    R.prop('key'),
    async ({resolver}) => createMesh(
      await resolver(),
    ),
  );
};

export default getMaterialMeshFrom;
