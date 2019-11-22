/**
 * Mesh resource meta descriptor, just store
 * basic info about mesh, without needing to load
 * whole OBJ file on server for example
 *
 * @todo
 *  Check if size param is sufficient
 */
export default class URLMeshResourceMeta {
  constructor({url, normalizedSize, textures}) {
    this.url = url;
    this.normalizedSize = normalizedSize;
    this.textures = textures;
  }
}
