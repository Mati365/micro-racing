import * as R from 'ramda';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

const generateTerrain = f => async ({
  atlasImageUrl,
  atlasSize,
  size,
}) => {
  const atlasImage = await createSingleResourceLoader()(atlasImageUrl);
  const texTile = f.tileTexture2D(
    {
      atlasImage,
      size: atlasSize,
    },
  );

  return f.mesh.tileTerrain(
    {
      texTile,
      size,
      items: R.times(
        () => ({
          uv: [1, 0],
        }),
        size.w * size.h,
      ),
    },
  );
};

export default generateTerrain;
