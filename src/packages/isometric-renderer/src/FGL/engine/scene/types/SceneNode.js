import * as R from 'ramda';
import {vec3, mat4} from '@pkg/gl-math';

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
  constructor({
    matrix = mat4.from.identity(), // executed before transforms
    transform = null,
    scene = null,
    uniforms = {},
    ubo = {},
    renderer,
    attributes,
  } = {}) {
    this.scene = scene;
    this.renderer = renderer;
    this.uniforms = uniforms;
    this.ubo = ubo;
    this.matrix = matrix;

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
    this.transformCache = null;
    this.invTransformCache = null;

    this.updateTransformCache();

    // third party flag fields
    Object.assign(this, attributes);
  }

  /**
   * @todo
   *  Flush cache?
   */
  setScene(scene) {
    this.scene = scene;
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
    const {transform} = this;
    let {matrix} = this;
    if (!transform) {
      this.transformCache = null;
      return;
    }

    const {rotate, scale, translate} = transform;

    // cache matrices
    const scaleMatrix = scale && mat4.from.scaling(scale);
    const rotateMatrix = rotate && mat4.from.rotation(rotate);
    const translateMatrix = translate && mat4.from.translation(translate);

    if (scaleMatrix && rotateMatrix && translateMatrix) {
      matrix = mat4.compose.mul(
        scaleMatrix,
        rotateMatrix,
        translateMatrix,
        matrix,
      );
    } else {
      if (rotateMatrix)
        matrix = mat4.mul(rotateMatrix, matrix);

      if (scaleMatrix)
        matrix = mat4.mul(scaleMatrix, matrix);

      if (translateMatrix)
        matrix = mat4.mul(translateMatrix, matrix);
    }

    // write cache
    this.transformCache = matrix;
    this.invTransformCache = mat4.inverse(matrix, this.invTransformCache);
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

  render(delta, mpMatrix) {
    const {
      invTransformCache, transformCache,
      scene, renderer, renderConfig,
    } = this;

    const {uniforms} = renderConfig;

    // matrices
    if (transformCache) {
      uniforms.invMMatrix = invTransformCache.array;
      uniforms.mMatrix = transformCache.array;
      uniforms.mpMatrix = mat4.mul(mpMatrix, transformCache).array;
    } else {
      uniforms.invMMatrix = null;
      uniforms.mMatrix = null;
      uniforms.mpMatrix = mpMatrix;
    }

    if (scene)
      scene.assignSceneRenderConfig(renderConfig);

    renderConfig.delta = delta;
    renderer(renderConfig);
  }
}