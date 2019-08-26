/* eslint-disable prefer-template */
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
    const {index} = this.options;
    const {indexedNodeStore, registry} = this.store;

    if (!node)
      return;

    if (indexedNodeStore[index]?.node === node)
      indexedNodeStore.delete(index);

    registry.splice(
      registry.findIndex(({node: registryNode}) => registryNode === node),
      1,
    );

    node.remove();
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

    // node is lazy added to DOM
    if (storeNode.parentNode === null)
      document.head.appendChild(storeNode);

    // add rules in proper order
    if (index === null || registry.length === 0)
      storeNode.appendChild(sheetNode);
    else {
      // find nearest node with lowest index
      const equalLevelNode = indexedNodeStore.get(index);

      if (equalLevelNode)
        insertAfter(equalLevelNode, sheetNode);
      else {
        const nearest = {
          index: null,
          node: null,
        };

        for (const [_index, _node] of indexedNodeStore.entries()) {
          // watch SSR code!
          if (index <= _index && _index >= nearest.index) {
            nearest.index = _index;
            nearest.node = _node;
          }
        }

        if (nearest.node !== null)
          insertAfter(nearest.node, sheetNode);
        else
          storeNode.appendChild(sheetNode);
      }
    }

    indexedNodeStore.set(index, sheetNode);
    sheet.node = sheetNode;

    return sheet;
  }
}
