import * as R from 'ramda';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import carTextureResource from '@game/res/model/cars/tex.png';

import blueCarResource from '@game/res/model/cars/blue.obj';
import redCarResource from '@game/res/model/cars/red.obj';

export const CARS_RESOURCES = {
  [CAR_TYPES.BLUE]: blueCarResource,
  [CAR_TYPES.RED]: redCarResource,
};

export const fetchCachedCarsTextures = R.once(
  () => createSingleResourceLoader()(carTextureResource),
);

export const fetchCachedCarResource = async ({
  withTextures = true,
  color = CAR_TYPES.RED,
} = {}) => {
  const [mesh, texture] = await Promise.all([
    createSingleResourceLoader()(CARS_RESOURCES[color]),
    withTextures
      ? fetchCachedCarsTextures()
      : Promise.resolve(null),
  ]);

  return {
    mesh,
    textures: [
      texture,
    ],
  };
};
