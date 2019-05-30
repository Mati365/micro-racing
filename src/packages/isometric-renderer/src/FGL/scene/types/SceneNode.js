import {mat4} from '@pkg/gl-math';

export default class SceneNode {
  constructor({
    matrix = mat4.from.identity(),
    transform = {
      rotate: null,
      scale: null,
      translate: null,
    },
    uniforms = {},
    renderer,
  }) {
    this.renderer = renderer;
    this.uniforms = uniforms;

    this.matrix = matrix;
    this.transform = transform;
    this.transformCache = null; // matrix * transform

    // just for reduce GC
    this.renderConfig = {
      uniforms: this.uniforms,
    };

    this.updateTransformCache();
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
    const {rotate, scale, translate} = this.transform;
    let {matrix} = this;

    if (rotate && scale && translate) {
      matrix = mat4.compose.mul(
        mat4.from.rotation(rotate),
        mat4.from.scaling(scale),
        mat4.from.translation(translate),
        matrix,
      );
    } else {
      if (rotate)
        matrix = mat4.mul(mat4.from.rotation(rotate), matrix);

      if (scale)
        matrix = mat4.mul(mat4.from.scaling(scale), matrix);

      if (translate)
        matrix = mat4.mul(mat4.from.translation(translate), matrix);
    }

    this.transformCache = matrix;
  }

  /**
   * Multiply inner transformations by transformMatrix
   *
   * @see
   *  It erases previous(scalle / translate / rotate) transforms!
   *
   * @param {Mat4} transformMatrix
   */
  applyTransform(transformMatrix, reset = false) {
    const matrix = (
      reset
        ? transformMatrix
        : mat4.mul(this.transformations.matrix, transformMatrix)
    );

    this.transformations = {
      rotate: null,
      scale: null,
      translate: null,
      matrix,
    };
    this._updateTransformCache();

    return this;
  }

  render(delta, mpMatrix) {
    const {
      transformCache, renderer, renderConfig,
    } = this;

    renderConfig.delta = delta;
    renderConfig.uniforms.mpMatrix = mat4.mul(
      mpMatrix,
      transformCache,
    ).array;

    renderer(renderConfig);
  }
}
