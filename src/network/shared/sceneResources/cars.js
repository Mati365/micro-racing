import * as R from 'ramda';

import {Size} from '@pkg/gl-math';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import carTextureResourceUrl from '@game/res/model/cars/tex.png';
import blueCarResourceUrl from '@game/res/model/cars/blue.obj';
import redCarResourceUrl from '@game/res/model/cars/red.obj';

import loadOBJ from '@pkg/isometric-renderer/FGL/engine/loaders/mesh/obj';
import URLMeshResourceMeta from './types/URLMeshResourceMeta';

/**
 * @todo
 *  Dynamic load meshes size
 */
export const CARS_RESOURCES = {
  [CAR_TYPES.BLUE]: new URLMeshResourceMeta(
    {
      url: blueCarResourceUrl,
      normalizedSize: new Size(1.25, 0.5781292235980715, 0.5133089596548264),
    },
  ),

  [CAR_TYPES.RED]: new URLMeshResourceMeta(
    {
      url: redCarResourceUrl,
      normalizedSize: new Size(0.5772158720597116, 1.25, 0.5580428491357967),
    },
  ),
};

export const fetchCachedCarsTextures = R.once(
  () => createSingleResourceLoader()(carTextureResourceUrl),
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
    createSingleResourceLoader()(CARS_RESOURCES[type].url),
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
