import {Size} from '@pkg/gl-math';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import carTextureResourceUrl from '@game/res/model/cars/tex.png';
import blueCarResourceUrl from '@game/res/model/cars/blue.obj';
import redCarResourceUrl from '@game/res/model/cars/red.obj';

import URLMeshResourceMeta from './types/URLMeshResourceMeta';
import {fetchMeshURLResource} from './utils';

/**
 * @todo
 *  Dynamic load meshes size
 */
export const CARS_RESOURCES = {
  [CAR_TYPES.BLUE]: new URLMeshResourceMeta(
    {
      url: blueCarResourceUrl,
      normalizedSize: new Size(0.5781292235980715, 1.0, 0.5133089596548264),
      textures: [
        carTextureResourceUrl,
      ],
    },
  ),

  [CAR_TYPES.RED]: new URLMeshResourceMeta(
    {
      url: redCarResourceUrl,
      normalizedSize: new Size(0.5772158720597116, 1.0, 0.5580428491357967),
      textures: [
        carTextureResourceUrl,
      ],
    },
  ),
};

/**
 * Loads cars OBJ and parses in to MeshVertexResource
 *
 * @param {Object} config
 *
 * @returns {MeshVertexResource}
 */
export const fetchCarMeshURLResource = ({
  withTextures = true,
  type = CAR_TYPES.RED,
} = {}) => (
  fetchMeshURLResource(CARS_RESOURCES[type], withTextures)
);
