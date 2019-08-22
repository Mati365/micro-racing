/* eslint-disable prefer-template */
import {MAGIC_STORE_ID_ATTRIB} from '../../constants/magicFlags';
import SheetStore from '../SheetStore';

const insertAfter = (prevRule, rule) => {
  prevRule.parentNode.insertBefore(rule, prevRule.nextSibling);
};

const createStyleTag = (sheetStoreID) => {
  const node = document.head.appendChild(document.createElement('style'));
  node.setAttribute('type', 'text/css');
  node.setAttribute(MAGIC_STORE_ID_ATTRIB, sheetStoreID);
  return node;
};

export class DOMSheet {
  constructor(store, id, node, index, rules, classes) {
    this.id = id;
    this.store = store;
    this.index = index;
    this.node = node;
    this.rules = rules;
    this.classes = classes;
  }

  remove() {
    const {index, node} = this;
    const {indexedNodeStore, registry} = this.store;

    if (indexedNodeStore[index]?.node === node)
      indexedNodeStore.delete(index);

    registry.splice(
      registry.findIndex(({node: registryNode}) => registryNode === node),
      1,
    );
  }
}

export default class DOMSheetStore extends SheetStore {
  constructor(...args) {
    super(...args);
    this.node = createStyleTag(this.id);
    this.indexedNodeStore = new Map;
  }

  createSheet(sheetID, parseResult, index = null) {
    const {text, rules, injectedClasses} = parseResult;
    const {node: sheetNode} = this;
    const {registry, indexedNodeStore} = this;

    const rulesNode = document.createTextNode(text);

    // add rules in proper order
    if (index === null || registry.length === 0)
      sheetNode.appendChild(rulesNode);
    else {
      // find nearest node with lowest index
      const equalLevelNode = indexedNodeStore.get(index);

      if (equalLevelNode)
        insertAfter(equalLevelNode, rulesNode);
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
          insertAfter(nearest.node, rulesNode);
        else
          sheetNode.appendChild(rulesNode);
      }
    }

    indexedNodeStore.set(index, rulesNode);

    return this.addToRegistry(
      new DOMSheet(
        this, sheetID, rulesNode,
        index, rules, injectedClasses,
      ),
    );
  }
}
