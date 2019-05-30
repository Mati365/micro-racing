import {Size} from '@pkg/gl-math';
import SceneNode from './SceneNode';

export default class MeshNode extends SceneNode {
  updateTransformCache() {
    super.updateTransformCache();

    const {scale} = this;
    const {size: meshSize} = this.meshDescriptor;

    this.size = new Size(
      meshSize.w * scale[0],
      meshSize.h * scale[1],
      meshSize.z * scale[2],
    );
  }

  get meshDescriptor() {
    return this.renderer.instance.meshDescriptor;
  }
}
