export default class URLMeshResource {
  constructor(meshVertexResource, textures) {
    this.meshVertexResource = meshVertexResource;
    this.textures = textures;
  }

  get loaderData() {
    return this.meshVertexResource;
  }
}
