import {lerp, vec3} from '@pkg/gl-math';

import SceneNode from './SceneNode';

export default class Camera extends SceneNode {
  constructor({
    pos,
    target,
    lerpSpeed = 0.1,
  }) {
    super(
      {
        transform: {
          translate: pos || vec3(0, 0, 0),
        },
      },
    );

    this.lerpSpeed = lerpSpeed;
    this.target = target;
  }

  render() {
    const {target, translate, lerpSpeed} = this;
    if (!target)
      return;

    translate.x = lerp(translate.x, -target.translate.x, lerpSpeed);
    translate.y = lerp(translate.y, -target.translate.y, lerpSpeed);

    this.updateTransformCache();
  }
}
