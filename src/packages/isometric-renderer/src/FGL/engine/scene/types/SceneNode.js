import * as R from 'ramda';
import {vec3, mat4} from '@pkg/gl-math';

export const hasTransforms = (transform) => {
  const {rotate, scale, translate} = transform;

  return !!rotate || !!scale || !!translate;
};

/**
 * Applies to matrix several transformations
 *
 * @param {Transforms} transform
 * @param {Matrix} dest
 */
export const applyTransformsToMatrix = (transform, dest = mat4.from.identity()) => {
  const {rotate, scale, translate} = transform;

  if (scale)
    mat4.mutable.scale(scale, dest);

  if (rotate)
    mat4.mutable.rotate(rotate, dest);

  if (translate)
    mat4.mutable.translate(translate, dest);

  return dest;
};

/**
 * @see
 *  Wraps renderer function with dynamicDescription and provides to it:
 *  - uniforms
 *    // matrices
 *    + invMMatrix
 *    + mMatrix
 *    + mpMatrix
 *    // lights
 *    + lighting (bool)
 */
export default class SceneNode {
  constructor(
    {
      f,
      id,
      initialCacheInit = true,
      matrix = mat4.from.identity(), // executed before transforms
      transform = null,
      scene = null,
      uniforms = {},
      ubo = {},
      renderer,
      attributes,
    } = {},
  ) {
    this.f = f; // optional renderer handle
    this.id = id;
    this.scene = scene;
    this.uniforms = uniforms;
    this.ubo = ubo;
    this.matrix = matrix;
    this.wireframe = null;

    // just for reduce GC
    this.renderConfig = {
      uniforms: this.uniforms,
      ubo: this.ubo,
    };

    // matrix cache for transform
    this.transform = R.mapObjIndexed(
      R.unless(
        R.isNil,
        R.apply(vec3),
      ),
      transform,
    );

    this.cache = {
      // transforms
      transform: null,
      invTransform: null,

      // render config
      mpTransform: mat4(),
    };

    if (initialCacheInit)
      this.updateTransformCache();

    // third party flag fields
    Object.assign(this, attributes);

    // lazy init renderer
    if (R.is(Promise, renderer))
      renderer.then(::this.setRenderer);
    else
      this.setRenderer(renderer);
  }

  release() {
    const {renderer, wireframe} = this;

    renderer?.release?.();
    wireframe?.release?.();
  }

  /**
   * @todo
   *  Flush cache?
   */
  setScene(scene) {
    this.scene = scene;
    return this;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    this.updateTransformCache();

    return this;
  }

  /**
   * Due to performance issues, save some MS using
   * mesh transform cache
   *
   * @todo
   *  Use private variables!
   */
  get rotate() { return this.transform.rotate; }

  set rotate(value) {
    this.transform.rotate = value;
    this.updateTransformCache();
  }

  get scale() { return this.transform.scale; }

  set scale(value) {
    this.transform.scale = value;
    this.updateTransformCache();
  }

  get translate() { return this.transform.translate; }

  set translate(value) {
    this.transform.translate = value;
    this.updateTransformCache();
  }

  /**
   * Mutliply matrix based on transfer parameters
   */
  updateTransformCache() {
    const {transform, cache} = this;
    let {matrix} = this;
    if (!transform) {
      this.transformCache = null;
      return;
    }

    // creates matrix from transfrom properties
    if (hasTransforms(transform))
      matrix = applyTransformsToMatrix(transform, mat4.clone(matrix));

    // write cache
    cache.transform = matrix;
    cache.invTransform = mat4.inverse(matrix, cache.invTransform);
  }

  /**
   * Multiply inner transformations by transformMatrix
   *
   * @see
   *  It erases previous(scalle / translate / rotate) transforms!
   *
   * @param {Mat4} transformMatrix
   */
  applyTransformMatrix(transformMatrix, reset = false) {
    const matrix = (
      reset
        ? transformMatrix
        : mat4.mul(transformMatrix, this.matrix)
    );

    this.matrix = matrix;
    this.updateTransformCache();

    return this;
  }

  applyTransformations(transform) {
    this.transform = transform;
    this.updateTransformCache();
  }

  update(interpolation) {
    const {wireframe} = this;

    if (wireframe && wireframe.update)
      wireframe.update(interpolation);
  }

  render(interpolate, mpMatrix) {
    const {
      wireframe, cache, scene,
      renderer, renderConfig,
    } = this;

    if (!renderer)
      return;

    const {uniforms} = renderConfig;
    const {
      transform: transformCache,
      invTransform: invTransformCache,

      // only for reduce GC usage
      mpTransform: mpTransformCache,
    } = cache;

    // matrices
    if (transformCache) {
      uniforms.invMMatrix = invTransformCache.array;
      uniforms.mMatrix = transformCache.array;
      uniforms.mpMatrix = mat4.mul(mpMatrix, transformCache, mpTransformCache).array;
    } else {
      uniforms.invMMatrix = null;
      uniforms.mMatrix = null;
      uniforms.mpMatrix = mpMatrix;
    }

    if (scene)
      scene.assignSceneRenderConfig(renderConfig);

    renderConfig.interpolate = interpolate;

    wireframe && wireframe.render(interpolate, mpMatrix);
    renderer(renderConfig);
  }
}
