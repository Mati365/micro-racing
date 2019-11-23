import * as R from 'ramda';

import loadOBJ from '@pkg/isometric-renderer/FGL/engine/loaders/mesh/obj';

import {createSingleResourceLoader} from '@pkg/resource-pack-loader';
import fetchCachedTexture from './fetchCachedTexture';

import {URLMeshResource} from '../types';

/**
 * @param {URLMeshResourceMeta} urlMeshResource
 * @param {Boolean} withTextures
 *
 * @returns {Mesh}
 */
const fetchMeshURLResource = async (urlMeshResource, withTextures = true) => {
  const [mesh, ...textures] = await Promise.all(
    [
      createSingleResourceLoader()(urlMeshResource.url),
      ...(
        withTextures
          ? R.map(fetchCachedTexture, urlMeshResource.textures)
          : []
      ),
    ],
  );

  // todo: change different types of meshes
  return new URLMeshResource(
    loadOBJ(
      {
        source: mesh,
        normalize: 'h',
      },
    ),
    textures,
  );
};

export default fetchMeshURLResource;
