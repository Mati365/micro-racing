import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

// global tex
import carTextureUrl from '@game/res/model/cars/tex.png';

// cars tex
import blueCarUrl from '@game/res/model/cars/blue.obj';
import redCarUrl from '@game/res/model/cars/red.obj';

import {CAR_TYPES} from '../../../constants/serverCodes';

const CARS_URLS = {
  [CAR_TYPES.BLUE]: blueCarUrl,
  [CAR_TYPES.RED]: redCarUrl,
};

const createTexturedCar = f => async color => f.loaders.mesh.from(
  {
    loader: 'obj',
    loaderData: {
      source: await createSingleResourceLoader()(CARS_URLS[color]),
      normalize: 'h',
    },
    textures: [
      await createSingleResourceLoader()(carTextureUrl),
    ],
  },
);

export default createTexturedCar;
