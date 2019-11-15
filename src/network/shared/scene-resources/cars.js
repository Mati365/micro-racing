import * as R from 'ramda';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import carTextureResource from '@game/res/model/cars/tex.png';
import blueCarResource from '@game/res/model/cars/blue.obj';
import redCarResource from '@game/res/model/cars/red.obj';

import loadOBJ from '@pkg/isometric-renderer/FGL/engine/loaders/mesh/obj';

export const CARS_RESOURCES = {
  [CAR_TYPES.BLUE]: blueCarResource,
  [CAR_TYPES.RED]: redCarResource,
};

export const fetchCachedCarsTextures = R.once(
  () => createSingleResourceLoader()(carTextureResource),
);

/**
 * Loads cars OBJ and parses in to MeshVertexResource
 *
 * @param {Object} config
 *
 * @returns {MeshVertexResource}
 */
export const fetchCachedCarResource = R.memoizeWith(JSON.stringify, async ({
  withTextures = true,
  type = CAR_TYPES.RED,
} = {}) => {
  const [mesh, texture] = await Promise.all([
    createSingleResourceLoader()(CARS_RESOURCES[type]),
    withTextures
      ? fetchCachedCarsTextures()
      : Promise.resolve(null),
  ]);

  return {
    meshVertexResource: loadOBJ(
      {
        source: mesh,
        normalize: 'h',
      },
    ),
    textures: [
      texture,
    ],
  };
});
