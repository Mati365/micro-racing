import {
  HTMLTextNode,
  MeshNode,
} from '@pkg/isometric-renderer/FGL/engine/scene';

import CarPhysicsBody from '@game/logic/physics/CarPhysicsBody';
import CarNodeEffects from './CarNodeEffects';

export default class CarNode extends MeshNode {
  constructor({
    f,
    player,
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

    this.player = player;
    this.wireframe = new CarNodeEffects(f, this);
    this.nickNode = new HTMLTextNode(
      {
        f,
        text: player.nick,
      },
    );
  }

  release() {
    const {nickNode} = this;

    super.release();
    nickNode.release();
  }

  update(interpolate) {
    const {
      nickNode, body,
      translate, rotate,
    } = this;

    // physics is slower than renderer
    // interpolate between frames
    const interpolatedBody = body.interpolatedUpdate(interpolate);

    rotate.z = interpolatedBody.angle;
    translate.xy = interpolatedBody.pos;
    nickNode.translate.xy = interpolatedBody.pos;

    this.updateTransformCache();

    // updated linked meshes
    super.update(interpolate);
  }

  render(interpolate, mpMatrix, f) {
    const {nickNode} = this;

    nickNode.render(interpolate, mpMatrix, f);
    super.render(interpolate, mpMatrix);
  }
}
