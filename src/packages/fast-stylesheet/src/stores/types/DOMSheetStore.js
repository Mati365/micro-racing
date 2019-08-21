import SheetStore from '../SheetStore';

const createStyleTag = (sheetStoreID) => {
  const node = document.head.appendChild(document.createElement('style'));
  node.setAttribute('type', 'text/css');
  node.setAttribute('stylesheet-store-id', sheetStoreID);
  return node;
};

export default class DOMSheetStore extends SheetStore {
  injectRules(classes, node = createStyleTag(this.id)) {
    const [text, injectedClasses] = this.parseRules(classes);
    node.appendChild(
      document.createTextNode(text),
    );

    return {
      sheetStore: this,
      classes: injectedClasses,
      node,
    };
  }
}
