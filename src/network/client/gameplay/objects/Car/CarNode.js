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
    body,
    ...meshConfig
  }) {
    super(meshConfig);

    if (body) {
      if (body instanceof CarPhysicsBody)
        this.body = body;
      else
        this.body = CarPhysicsBody.fromJSON(body);
    } else {
      this.body = new CarPhysicsBody(
        {
          angle: this.rotate.z,
          pos: this.translate,
          size: this.size.toVec(),
        },
      );
    }

    this.nick = nick;
    this.wireframe = new CarNodeEffects(f, this);
    this.nickNode = new HTMLTextNode(
      {
        f,
        text: this.nick,
      },
    );
  }

  release() {
    const {nickNode} = this;

    super.release();
    nickNode.release();
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
