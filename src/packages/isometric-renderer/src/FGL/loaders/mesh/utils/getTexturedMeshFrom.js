import * as R from 'ramda';

import {createUBO} from '../../../buffer/types';
import {packMaterialsBuffer} from '../../../predefined/materials/createTextureSpriteMaterial';

const getTexturedMeshFrom = (f, gl) => async (
  {
    loader = 'obj',
    loaderData,
    textures = [],
    uniforms,
    ubo,
    ...params
  },
) => {
  const {
    size,
    vao,
    materials,
    textures: loaderTextures,
  } = f.loaders.mesh[loader](loaderData);

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
      material: f.material.textureSprite,
      textures: shaderTextures,
      uniforms: {
        textured: !R.isEmpty(shaderTextures),
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

export default getTexturedMeshFrom;
