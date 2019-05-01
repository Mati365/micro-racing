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

const createTexturedCar = f => async (color) => {
  const {vao} = f.loaders.mesh.obj(
    await createSingleResourceLoader()(CARS_URLS[color]),
  );

  const image = await createSingleResourceLoader()(carTextureUrl);
  return f.mesh(
    {
      renderMode: f.flags.TRIANGLES,
      material: f.material.textureSprite,
      textures: [
        f.texture2D(
          {
            image,
          },
        ),
      ],
      vao,
    },
  );
};

export default createTexturedCar;
