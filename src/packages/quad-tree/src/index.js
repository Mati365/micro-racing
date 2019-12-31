import aabb from '@pkg/physics/engines/aabb';
import Rectangle from '../../gl-math/src/classes/Rectangle';

export const DEFAULT_QUAD_TREE_CONFIG = Object.freeze(
  {
    boxSelector: node => node.box || (node.body && node.body.box),
    moveableFlagSelector: node => node && node.body && node.body.moveable,
    separateMoveable: true,
    clusterNodesCount: 2,
    maxDepth: 8,
  },
);

const uniqPush = (src, dest) => {
  for (let i = src.length - 1; i >= 0; --i) {
    const srcItem = src[i];
    if (dest.indexOf(srcItem) === -1)
      dest.push(srcItem);
  }

  return dest;
};

/**
 *
 * @see {@link https://gamedev.stackexchange.com/a/20609}
 *
 * @export
 * @class QuadTree
 */
export default class QuadTree {
  constructor(box, config, nodes, depth = 1, parent) {
    this.box = box;
    this.config = config || DEFAULT_QUAD_TREE_CONFIG;
    this.depth = depth;

    this.nodes = [];
    this.moveableNodes = this.config.separateMoveable ? [] : null;

    this.allNodes = parent ? parent.allNodes : [];
    this.parent = parent;

    // subtrees
    this.nw = null; this.ne = null;
    this.sw = null; this.se = null;

    if (nodes)
      nodes.forEach(::this.insert);
  }

  isEmpty() {
    return !this.nodes.length;
  }

  isDivided() {
    return this.nw !== null;
  }

  iterateQuads(fn) {
    fn(this);

    if (this.isDivided()) {
      const {nw, ne, sw, se} = this;

      nw.iterateQuads(fn);
      ne.iterateQuads(fn);
      sw.iterateQuads(fn);
      se.iterateQuads(fn);
    }
  }

  remove(node) {
    const {depth} = this;

    if (depth === 1) {
      const {allNodes, config, moveableNodes} = this;
      if (depth === 1 && config.separateMoveable && moveableNodes.length) {
        const moveableIndex = moveableNodes.indexOf(node);
        if (moveableIndex !== -1)
          moveableNodes.splice(moveableIndex, 1);
      }

      const index = allNodes.indexOf(node);
      if (index !== -1)
        allNodes.splice(index, 1);
    }

    if (this.isDivided()) {
      const {config, nw, ne, sw, se} = this;

      nw.remove(node);
      ne.remove(node);
      sw.remove(node);
      se.remove(node);

      if (nw.nodes && ne.nodes && sw.nodes && se.nodes) {
        const nodes = [];
        uniqPush(nw.nodes, nodes);
        uniqPush(ne.nodes, nodes);
        uniqPush(sw.nodes, nodes);
        uniqPush(se.nodes, nodes);

        if (nodes.length <= config.clusterNodesCount) {
          this.nodes = nodes;
          this.undivide();
        }
      }
    } else {
      const {nodes} = this;

      if (nodes.length) {
        const index = nodes.indexOf(node);
        index !== -1 && this.nodes.splice(index, 1);
      }
    }

    return this;
  }

  undivide() {
    delete this.nw;
    delete this.ne;
    delete this.sw;
    delete this.se;

    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
  }

  release() {
    this.undivide();
    this.list = [];
  }

  divide() {
    const {box, nodes, config, depth} = this;
    if (depth >= config.maxDepth)
      return false;

    const halfW = box.w / 2;
    const halfH = box.h / 2;
    const nestedDepth = this.depth + 1;

    this.nw = new QuadTree(
      new Rectangle(box.x, box.y, halfW, halfH),
      config,
      nodes,
      nestedDepth,
      this,
    );

    this.ne = new QuadTree(
      new Rectangle(box.x + halfW, box.y, halfW, halfH),
      config,
      nodes,
      nestedDepth,
      this,
    );

    this.sw = new QuadTree(
      new Rectangle(box.x, box.y + halfH, halfW, halfH),
      config,
      nodes,
      nestedDepth,
      this,
    );

    this.se = new QuadTree(
      new Rectangle(box.x + halfW, box.y + halfH, halfW, halfH),
      config,
      nodes,
      nestedDepth,
      this,
    );

    this.nodes = null;
    return true;
  }

  retrieve(box, container = []) {
    const {depth, config, moveableNodes} = this;
    if (depth === 1 && config.separateMoveable && moveableNodes && moveableNodes.length)
      container.push(...moveableNodes);

    if (!aabb(this.box, box))
      return container;

    if (this.isDivided()) {
      const {nw, ne, sw, se} = this;

      nw.retrieve(box, container);
      ne.retrieve(box, container);
      sw.retrieve(box, container);
      se.retrieve(box, container);
    } else {
      const {nodes} = this;

      for (let i = nodes.length - 1; i >= 0; --i) {
        const node = nodes[i];
        const nodeBox = config.boxSelector(node);

        if (nodeBox && aabb(box, nodeBox) && container.indexOf(node) === -1)
          container.push(node);
      }
    }

    return container;
  }

  insert(node) {
    const {depth, box, allNodes, nodes, moveableNodes, config} = this;
    const nodeBox = config.boxSelector(node);

    if (depth === 1)
      allNodes.push(node);

    if (depth === 1 && config.separateMoveable && config.moveableFlagSelector(node)) {
      moveableNodes.push(node);
      return true;
    }

    if (!nodeBox || !aabb(box, nodeBox))
      return false;

    if (this.isDivided()) {
      const {nw, ne, sw, se} = this;

      nw.insert(node);
      ne.insert(node);
      sw.insert(node);
      se.insert(node);
    } else {
      nodes.push(node);

      if (nodes.length > config.clusterNodesCount)
        this.divide();
    }

    return true;
  }
}
