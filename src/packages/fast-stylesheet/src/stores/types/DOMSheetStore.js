
/* eslint-disable prefer-template, no-restricted-syntax */
import {MAGIC_HYDRATED_STORE_ID_ATTRIB} from '../../constants/magicFlags';

import SheetStore from '../SheetStore';
import Sheet from '../Sheet';

const insertAfter = (prevRule, rule) => {
  prevRule.parentNode.insertBefore(rule, prevRule.nextSibling);
};

const createStyleTag = () => {
  const node = document.createElement('style');
  node.setAttribute('type', 'text/css');
  return node;
};

export class DOMSheet extends Sheet {
  node = null;

  remove() {
    const {node} = this;
    const {index, store, sheetID} = this.options;
    const {indexedNodeStore, registry} = store;

    if (!node)
      return;

    this.usages--;
    if (this.usages <= 0) {
      delete store.cacheStore[sheetID];

      const equalLevelNodes = indexedNodeStore.get(index);
      if (equalLevelNodes) {
        const nodeIndex = equalLevelNodes.indexOf(node);
        if (nodeIndex !== -1)
          equalLevelNodes.splice(nodeIndex, 1);
      }

      registry.splice(
        registry.indexOf(this),
        1,
      );

      // ID is equal for cached stylesheets
      node.remove();
    }
  }
}

export default class DOMSheetStore extends SheetStore {
  constructor(config) {
    super(config);

    this.node = config.node || createStyleTag();
    this.node.setAttribute(MAGIC_HYDRATED_STORE_ID_ATTRIB, '');

    this.indexedNodeStore = new Map;
  }

  createSheet(sheetID, styles, options) {
    const sheet = new DOMSheet(sheetID, styles, options);
    const {text, index} = sheet;

    const {node: storeNode} = this;
    const {registry, indexedNodeStore} = this;

    const sheetNode = document.createTextNode(text);
    const equalLevelNodes = indexedNodeStore.get(index);

    // node is lazy added to DOM
    if (storeNode.parentNode === null)
      document.head.appendChild(storeNode);

    // add rules in proper order
    if (index === null && registry.length === 0)
      storeNode.appendChild(sheetNode);
    else if (equalLevelNodes?.length) {
      // find nearest node with lowest index
      insertAfter(
        equalLevelNodes[equalLevelNodes.length - 1],
        sheetNode,
      );
    } else {
      const nearest = {
        index: null,
        node: null,
      };

      for (const [_index, _node] of indexedNodeStore.entries()) {
        // watch SSR code!
        if (index >= _index && _index >= nearest.index) {
          nearest.index = _index;
          nearest.node = _node;
        }
      }

      if (nearest.node !== null)
        insertAfter(nearest.node, sheetNode);
      else if (storeNode.firstChild)
        storeNode.insertBefore(sheetNode, storeNode.firstChild);
      else
        storeNode.appendChild(sheetNode);
    }

    indexedNodeStore.set(
      index,
      [
        ...(equalLevelNodes || []),
        sheetNode,
      ],
    );

    sheet.node = sheetNode;

    return sheet;
  }
}
