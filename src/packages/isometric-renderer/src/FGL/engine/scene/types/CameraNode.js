import {lerp, mat4, vec3} from '@pkg/gl-math';

import SceneNode from './SceneNode';

export default class Camera extends SceneNode {
  constructor({
    pos,
    target,
    lerpSpeed = 0.45,
    viewportOffset = [0, 0.9, 0],
  }) {
    super(
      {
        transform: {
          translate: pos || vec3(0, 0, 0),
        },
      },
    );

    this.viewportOffset = viewportOffset;
    this.lerpSpeed = lerpSpeed;
    this.target = target;
  }

  get mpMatrix() {
    return this.cache.mpTransform;
  }

  render(interpolate, mpMatrix) {
    const {
      viewportOffset, cache,
      target, translate, lerpSpeed,
    } = this;

    if (!target)
      return;

    translate.x = lerp(translate.x, -target.translate.x, lerpSpeed);
    translate.y = lerp(translate.y, -target.translate.y, lerpSpeed);

    // assign transform
    this.updateTransformCache();
    cache.mpTransform = mat4.mutable.translate(
      viewportOffset,
      mat4.mul(mpMatrix, this.cache.transform, cache.mpTransform),
    );
  }
}
