import {Size, BoundingRect} from '@pkg/gl-math';
import SceneNode from './SceneNode';
import MeshWireframe from './MeshWireframe';

export default class MeshNode extends SceneNode {
  wireframe = null;

  /**
   * + size record is required for MeshNode
   *
   * @param {Object} config
   */
  constructor(
    {
      renderWireframe = false,
      wireframeColor = null,
      ...config
    },
  ) {
    super(config);

    const {f} = this;
    if (f && renderWireframe)
      this.wireframe = new MeshWireframe(f, this, wireframeColor);
  }

  setRenderer(renderer) {
    if (renderer === this.renderer)
      return;

    this.renderer && this.release();
    super.setRenderer(renderer);
  }

  release() {
    const {meshDescriptor} = this;

    super.release();
    meshDescriptor && meshDescriptor.release();
  }

  updateTransformCache() {
    super.updateTransformCache();

    // Size cache
    if (!this.size)
      this.size = new Size;

    if (!this.boundingRect)
      this.boundingRect = new BoundingRect;

    const {meshDescriptor} = this;
    if (meshDescriptor) {
      const {size: meshSize} = meshDescriptor;
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
  }

  get meshDescriptor() {
    const {renderer} = this;
    if (!renderer)
      return null;

    return renderer.instance.meshDescriptor;
  }
}
