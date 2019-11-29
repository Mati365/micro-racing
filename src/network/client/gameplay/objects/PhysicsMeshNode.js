import {MeshNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import PhysicsBody from '@pkg/physics-scene/src/types/PhysicsBody';

export default class PhysicsMeshNode extends MeshNode {
  constructor({
    body,
    physicsBodyEngine = PhysicsBody,
    ...meshConfig
  }) {
    super(meshConfig);

    this.physicsBodyEngine = physicsBodyEngine;
    this.bodyConfig = body;
    this.interpolatedBody = null; // see update()
  }

  setRenderer(renderer) {
    const {
      physicsBodyEngine: PhysicsBodyEngine,
      bodyConfig,
    } = this;

    super.setRenderer(renderer);

    if (bodyConfig) {
      if (bodyConfig instanceof PhysicsBodyEngine)
        this.body = bodyConfig;
      else
        this.body = PhysicsBodyEngine.fromJSON(bodyConfig);
    } else {
      this.body = new PhysicsBodyEngine(
        {
          angle: this.rotate.z,
          pos: this.translate,
          size: this.size.toVec(),
        },
      );
    }
  }

  update(interpolate) {
    const {body, translate, rotate, interpolatedBody} = this;

    if (body && (!interpolatedBody || body.moveable)) {
      // physics is slower than renderer
      // interpolate between frames
      this.interpolatedBody = body.interpolatedUpdate(interpolate);

      rotate.z = this.interpolatedBody.angle;
      translate.xy = this.interpolatedBody.pos;

      this.updateTransformCache();
    }

    // updated linked meshes
    super.update(interpolate);
  }
}
