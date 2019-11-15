export default class MeshVertexResource {
  constructor({materials, textures, normalized, vertices, size}) {
    this.materials = materials;
    this.textures = textures;
    this.normalized = normalized;
    this.vertices = vertices;
    this.size = size;
  }
}
