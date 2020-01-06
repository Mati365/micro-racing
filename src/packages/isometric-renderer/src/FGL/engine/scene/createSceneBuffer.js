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

export class SceneItemsContainer {
  allNodes = [];

  insert(node) {
    this.allNodes.push(node);
  }

  remove(node) {
    this.allNodes = R.without([node], this.allNodes);
  }

  release() {
    this.allNodes = [];
  }
}

export class SceneBuffer {
  constructor(
    f,
    {
      itemsContainer = new SceneItemsContainer,
      cameraConfig,
    } = {},
  ) {
    this.f = f;

    // lists
    this.itemsContainer = itemsContainer;
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
        ...cameraConfig,
      },
    );
  }

  get items() {
    return this.itemsContainer.allNodes;
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

    this.itemsContainer.remove(node);
    node.release?.();

    return this;
  }

  async createNode(nodeConfig) {
    const {f, itemsContainer} = this;
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
    itemsContainer.insert(node);
    return node;
  }

  release() {
    const {itemsContainer} = this;
    const {allNodes} = itemsContainer;

    for (let i = 0, len = allNodes.length; i < len; ++i)
      allNodes[i]?.release();

    itemsContainer.release();
  }

  /**
   * SceneNode methods
   */
  update(interpolate) {
    const {itemsContainer: {allNodes}} = this;

    for (let i = 0, len = allNodes.length; i < len; ++i) {
      const item = allNodes[i];
      item.update && item.update(interpolate);
    }
  }

  render(interpolate, mpMatrix) {
    const {
      f, camera,
      itemsContainer: {allNodes},
    } = this;

    const transparentNodes = [];

    camera.render(interpolate, mpMatrix);

    for (let i = 0, len = allNodes.length; i < len; ++i) {
      const node = allNodes[i];
      const {opacity} = node.renderConfig.uniforms;

      node.prevInViewport = node.inViewport === undefined ? true : node.inViewport;
      node.inViewport = camera.isInViewport(node);

      if (!node.inViewport && !node.ignoreRenderCulling)
        continue;

      if (opacity === undefined || opacity === null || opacity === 1.0)
        node.render(interpolate, camera.mpMatrix, f);
      else
        transparentNodes.push(node);
    }

    for (let i = 0, len = transparentNodes.length; i < len; ++i)
      transparentNodes[i].render(interpolate, camera.mpMatrix, f);
  }
}

const createSceneBuffer = (...args) => new SceneBuffer(...args);

export default createSceneBuffer;
