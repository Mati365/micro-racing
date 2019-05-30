import * as R from 'ramda';
import SceneNode from './types/SceneNode';

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

/**
 * Render list of nodes on scene
 *
 * @todo
 *  Add camera support!
 */
const createSceneBuffer = (f) => {
  const list = [];
  const context = {};

  const createNode = async (nodeConfig) => {
    const sceneParams = {
      f,
    };

    if (R.is(Function, nodeConfig)) {
      return createNode(
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

    list.push(node);
    return node;
  };

  const render = (delta, mpMatrix) => {
    for (let i = 0, len = list.length; i < len; ++i)
      list[i].render(delta, mpMatrix);
  };

  const update = (delta) => {
    for (let i = 0, len = list.length; i < len; ++i) {
      const item = list[i];
      item.update && item.update(delta);
    }
  };

  Object.assign(
    context,
    {
      createNode,
      render,
      update,
    },
  );

  return {
    ...context,
    chain: chainMethods(context),
  };
};

export default createSceneBuffer;
