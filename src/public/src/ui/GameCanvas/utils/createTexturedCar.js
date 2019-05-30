import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

// global tex
import carTextureUrl from '@game/res/model/cars/tex.png';

// cars tex
import blueCarUrl from '@game/res/model/cars/blue.obj';
import redCarUrl from '@game/res/model/cars/red.obj';

export const CAR_COLORS = {
  RED: 'RED',
  BLUE: 'BLUE',
};

const CARS_URLS = {
  [CAR_COLORS.BLUE]: blueCarUrl,
  [CAR_COLORS.RED]: redCarUrl,
};

const createTexturedCar = f => async color => f.loaders.mesh.from(
  {
    loader: 'obj',
    loaderData: {
      source: await createSingleResourceLoader()(CARS_URLS[color]),
      normalize: 'w',
      axis: [1, 1, -1],
    },
    textures: [
      await createSingleResourceLoader()(carTextureUrl),
    ],
  },
);

export default createTexturedCar;
