
import {toRadians} from '@pkg/gl-math';
import {
  SceneNode,
  MeshNode,
} from '@pkg/isometric-renderer/FGL/scene';

import CarPhysicsBody from './CarPhysicsBody';

export default class CarNode extends MeshNode {
  constructor(meshConfig) {
    super(meshConfig);

    const {f} = meshConfig;
    this.wireframe = new SceneNode(
      {
        renderer: f.mesh.box(),
        uniforms: {
          color: f.colors.BLUE,
        },
      },
    );
    this.body = new CarPhysicsBody(
      {
        angle: this.rotate.z,
        pos: this.translate,
        size: this.size.toVec(),
      },
    );
  }

  update(delta) {
    const {body, translate, rotate, size, wireframe} = this;

    body.update(delta);
    [translate.x, translate.y] = body.pos;
    rotate.z = body.angle - toRadians(90);

    wireframe.applyTransformations(
      {
        scale: size.toVec(),
        rotate,
        translate,
      },
    );
    this.updateTransformCache();
  }

  render(delta, mpMatrix) {
    const {wireframe} = this;

    wireframe.render(delta, mpMatrix);
    super.render(delta, mpMatrix);
  }
}
