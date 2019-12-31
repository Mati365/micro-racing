import {MeshNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import PhysicsBody from '@pkg/physics-scene/src/types/PhysicsBody';

export default class PhysicsMeshNode extends MeshNode {
  constructor(
    {
      body,
      physicsBodyEngine = PhysicsBody,
      ...meshConfig
    },
  ) {
    super(meshConfig);

    this.physicsBodyEngine = physicsBodyEngine;
    this.bodyConfig = body;
    this.cachedInterpolatedBody = null; // see update()

    this.initBodyConfig();
  }

  initBodyConfig() {
    const {
      physicsBodyEngine: PhysicsBodyEngine,
      bodyConfig,
    } = this;

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
          size: this.size,
        },
      );
    }
  }

  setRenderer(renderer) {
    super.setRenderer(renderer);

    if (!this.body && this.physicsBodyEngine)
      this.initBodyConfig();
  }

  update(interpolate) {
    const {body, translate, rotate, cachedInterpolatedBody} = this;

    if (body && (!cachedInterpolatedBody || body.moveable)) {
      // physics is slower than renderer
      // interpolate between frames
      this.cachedInterpolatedBody = body.interpolatedUpdate(interpolate);

      rotate.z = this.cachedInterpolatedBody.angle;
      translate.xy = this.cachedInterpolatedBody.pos;

      this.updateTransformCache();
    }

    // updated linked meshes
    super.update(interpolate);
  }
}
