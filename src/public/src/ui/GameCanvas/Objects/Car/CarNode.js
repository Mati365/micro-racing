import {
  SceneNode,
  MeshNode,
} from '@pkg/isometric-renderer/FGL/scene';

export default class CarNode extends MeshNode {
  constructor(meshConfig) {
    super(meshConfig);

    const {size} = this;
    const {transform, f} = meshConfig;

    this.wireframe = new SceneNode(
      {
        renderer: f.mesh.box(),
        uniforms: {
          color: f.colors.BLUE,
        },
        transform: {
          scale: size.toVec(),
          translate: [
            transform.translate[0] - size.w / 2,
            transform.translate[1] - size.h / 2,
            transform.translate[2] + Math.abs(size.z / 2),
          ],
        },
      },
    );
    // this.body = new CarPhysicsBody(bodyConfig);
  }

  render(delta, mpMatrix) {
    const {wireframe} = this;

    wireframe.render(delta, mpMatrix);
    super.render(delta, mpMatrix);
  }
}
