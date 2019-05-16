import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import treeUrl from '@game/res/model/trees/tree_lowpoly.obj';
import treeMtlUrl from '@game/res/model/trees/tree_lowpoly.mtl';

const createTexturedTree = async f => f.loaders.mesh.from(
  {
    loader: 'obj',
    loaderData: {
      source: await createSingleResourceLoader()(treeUrl),
      mtl: await createSingleResourceLoader()(treeMtlUrl),
    },
  },
);

export default createTexturedTree;
