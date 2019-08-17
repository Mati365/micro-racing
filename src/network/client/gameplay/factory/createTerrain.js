import atlasDefaultUrl from '@game/res/img/atlas.png';

import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

const createTerrain = f => async ({
  atlasImageUrl = atlasDefaultUrl,
  atlasSize = {
    w: 5,
    h: 5,
  },
  size,
  items,
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
      items,
    },
  );
};

export default createTerrain;
