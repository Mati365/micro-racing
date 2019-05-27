import {mat4} from '@pkg/gl-math';
import * as R from 'ramda';

const chainMethods = (context) => {
  const boundContext = {};

  boundContext.current = R.mapObjIndexed(
    fn => (...args) => {
      fn(...args);
      return boundContext.current;
    },
    context,
  );

  return boundContext.current;
};

class SceneNode {
  constructor({
    matrix = mat4.from.identity(),
    transform = {
      rotate: null,
      scale: null,
      translate: null,
    },
    uniforms = {},
    mesh,
  }) {
    this.mesh = mesh;
    this.uniforms = uniforms;

    this.matrix = matrix;
    this.transform = transform;
    this.transformCache = null; // matrix * transform

    // just for reduce GC
    this.renderConfig = {
      uniforms: this.uniforms,
    };

    this._updateTransformCache();
  }

  /**
   * Due to performance issues, save some MS using
   * mesh transform cache
   */
  get rotate() { return this.transform.rotate; }

  set rotate(value) {
    this.transform.rotate = value;
    this._updateTransformCache();
  }

  get scale() { return this.transform.scale; }

  set scale(value) {
    this.transform.scale = value;
    this._updateTransformCache();
  }

  get translate() { return this.transform.translate; }

  set translate(value) {
    this.transform.translate = value;
    this._updateTransformCache();
  }

  _updateTransformCache() {
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
        matrix = mat4.mul(matrix, mat4.from.rotation(rotate));

      if (scale)
        matrix = mat4.mul(matrix, mat4.from.scaling(scale));

      if (translate)
        matrix = mat4.mul(matrix, mat4.from.translation(translate));
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
      transformCache, mesh, renderConfig,
    } = this;

    renderConfig.delta = delta;
    renderConfig.uniforms.mpMatrix = mat4.mul(
      mpMatrix,
      transformCache,
    ).array;

    mesh(renderConfig);
  }
}

/**
 * Render list of nodes on scene
 *
 * @todo
 *  Add camera support!
 */
const createSceneBuffer = () => {
  const list = [];

  const createNode = async (nodeConfig) => {
    if (R.is(Function, nodeConfig))
      return createNode(await nodeConfig());

    const node = new SceneNode(nodeConfig);
    list.push(node);
    return node;
  };

  const render = (delta, mpMatrix) => {
    for (let i = 0, len = list.length; i < len; ++i)
      list[i].render(delta, mpMatrix);
  };

  const utils = {
    createNode,
    render,
  };

  return {
    ...utils,
    chain: chainMethods(utils),
  };
};

export default createSceneBuffer;
