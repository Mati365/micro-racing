import {
  HTMLTextNode,
  MeshNode,
} from '@pkg/isometric-renderer/FGL/engine/scene';

import CarPhysicsBody from '@game/logic/physics/CarPhysicsBody';
import CarNodeEffects from './CarNodeEffects';

export default class CarNode extends MeshNode {
  constructor({
    f,
    nick,
    ...meshConfig
  }) {
    super(meshConfig);

    this.nick = nick;
    this.body = new CarPhysicsBody(
      {
        angle: this.rotate.z,
        pos: this.translate,
        size: this.size.toVec(),
      },
    );

    this.wireframe = new CarNodeEffects(f, this);
    this.nickNode = new HTMLTextNode(
      {
        f,
        text: this.nick,
      },
    );
  }

  update(delta) {
    const {
      nickNode, body,
      translate, rotate,
    } = this;

    // update attributes
    body.update(delta);
    rotate.z = body.angle;

    [translate.x, translate.y] = body.pos;
    [nickNode.translate.x, nickNode.translate.y] = body.pos;

    this.updateTransformCache();

    // updated linked meshes
    super.update(delta);
  }

  render(delta, mpMatrix, f) {
    const {nickNode} = this;

    nickNode.render(delta, mpMatrix, f);
    super.render(delta, mpMatrix);
  }
}
