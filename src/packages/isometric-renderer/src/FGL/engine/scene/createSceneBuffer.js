import * as R from 'ramda';

import SceneNode from './types/SceneNode';
import {LightsSceneManager} from '../lighting';
import {
  CameraNode,
  LightNode,
} from './types';

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

export class SceneBuffer {
  constructor(f) {
    this.f = f;

    // lists
    this.list = [];
    this.lights = new LightsSceneManager(
      {
        f,
      },
    );

    // used in creator
    this.chain = chainMethods(
      {
        createNode: ::this.createNode,
        createLight: ::this.createLight,
      },
    );

    // very simple camera
    this.camera = new CameraNode(
      {
        target: null,
        pos: null,
      },
    );
  }

  /**
   * GL Context
   */
  assignSceneRenderConfig(renderConfig) {
    const {lights} = this;

    renderConfig.uniforms.lighting = !lights.empty;
    renderConfig.ubo.lightsBlock = lights.ubo;
  }

  /**
   * Node list accessors
   */
  createLight(light) {
    this.createNode(
      new LightNode(
        {
          f: this.f,
          light,
        },
      ),
    );

    return this;
  }

  removeNode(node) {
    if (!node)
      return this;

    this.list = R.without([node], this.list);
    node.release?.();

    return this;
  }

  async createNode(nodeConfig) {
    const {f, list} = this;
    const sceneParams = {
      f,
    };

    if (R.is(Function, nodeConfig)) {
      return this.createNode(
        await nodeConfig(sceneParams),
      );
    }

    const node = (
      nodeConfig instanceof SceneNode
        ? nodeConfig
        : new SceneNode(
          {
            ...nodeConfig,
            ...sceneParams,
          },
        )
    );

    node.setScene(this);
    list.push(node);
    return node;
  }

  /**
   * SceneNode methods
   */
  update(interpolate) {
    const {list} = this;

    for (let i = 0, len = list.length; i < len; ++i) {
      const item = list[i];
      item.update && item.update(interpolate);
    }
  }

  render(interpolate, mpMatrix) {
    const {f, list, camera} = this;

    camera.render(interpolate, mpMatrix);
    for (let i = 0, len = list.length; i < len; ++i) {
      const node = list[i];

      node.render(interpolate, camera.mpMatrix, f);
    }
  }
}

const createSceneBuffer = (...args) => new SceneBuffer(...args);

export default createSceneBuffer;
