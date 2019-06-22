import {vec2} from '@pkg/gl-math';

/**
 * @param {WebGLRenderingContext} gl
 * @param {FGL} fgl
 */
const tileTexture2D = (gl, fgl) => ({
  atlasImage,
  size,
}) => ({
  texture: fgl.texture2D(
    {
      image: atlasImage,
    },
  ),
  size,
  uvSize: vec2(
    1.0 / size.w,
    1.0 / size.h,
  ),
});

export default tileTexture2D;
