import {MeshNode} from '@pkg/isometric-renderer/FGL/engine/scene';

import CarPhysicsBody from './CarPhysicsBody';
import CarNodeEffects from './CarNodeEffects';

export default class CarNode extends MeshNode {
  constructor({f, ...meshConfig}) {
    super(meshConfig);

    this.body = new CarPhysicsBody(
      {
        angle: this.rotate.z,
        pos: this.translate,
        size: this.size.toVec(),
      },
    );

    this.wireframe = new CarNodeEffects(f, this);
  }

  update(delta) {
    const {body, translate, rotate} = this;

    // update attributes
    body.update(delta);
    rotate.z = body.angle;
    [translate.x, translate.y] = body.pos;
    this.updateTransformCache();

    // updated linked meshes
    super.update(delta);
  }
}
