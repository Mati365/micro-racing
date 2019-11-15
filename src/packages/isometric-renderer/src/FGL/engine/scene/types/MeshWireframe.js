import SceneNode from './SceneNode';

export default class MeshWireframe extends SceneNode {
  constructor(f, sceneNode) {
    super(
      {
        renderer: f.mesh.box(),
        uniforms: {
          color: f.colors.BLUE,
        },
      },
    );

    this.sceneNode = sceneNode;
  }

  update() {
    const {size, rotate, translate} = this.sceneNode;

    this.applyTransformations(
      {
        scale: size.toVec(),
        rotate,
        translate,
      },
    );
  }
}
