import * as R from 'ramda';

import {fetchCachedCarResource} from '@game/shared/enumeratedResources/cars';

const createTexturedCar = f => R.memoizeWith(
  R.identity,
  async (color) => {
    const {mesh, textures} = await fetchCachedCarResource(
      {
        color,
      },
    );

    return f.loaders.mesh.from(
      {
        loader: 'obj',
        loaderData: {
          source: mesh,
          normalize: 'h',
        },
        textures,
      },
    );
  },
);

export default createTexturedCar;
