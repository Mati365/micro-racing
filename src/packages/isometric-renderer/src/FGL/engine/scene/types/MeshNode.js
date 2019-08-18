import {Size, BoundingRect} from '@pkg/gl-math';
import SceneNode from './SceneNode';
import MeshWireframe from './MeshWireframe';

export default class MeshNode extends SceneNode {
  wireframe = null;

  constructor(config) {
    super(config);

    if (config.f)
      this.wireframe = new MeshWireframe(config.f, this);
  }

  release() {
    const {meshDescriptor} = this;

    super.release();
    meshDescriptor.release();
  }

  updateTransformCache() {
    super.updateTransformCache();

    // Size cache
    if (!this.size)
      this.size = new Size;

    if (!this.boundingRect)
      this.boundingRect = new BoundingRect;

    const {size: meshSize} = this.meshDescriptor;
    const {
      scale, translate,
      size, boundingRect,
    } = this;

    size.w = meshSize.w * scale[0];
    size.h = meshSize.h * scale[1];
    size.z = meshSize.z * scale[2];

    boundingRect.size = size;
    boundingRect.translate = translate;
  }

  get meshDescriptor() {
    return this.renderer.instance.meshDescriptor;
  }
}
