import SheetStore from '../SheetStore';

export class ServerSheet {
  constructor(id, index, text, classes) {
    this.id = id;
    this.index = index;
    this.text = text;
    this.classes = classes;
  }
}

export default class SSRSheetStore extends SheetStore {
  createSheet(sheetID, parseResult, index = null) {
    const {text, injectedClasses} = parseResult;

    return this.addToRegistry(
      new ServerSheet(
        sheetID, index,
        text, injectedClasses,
      ),
    );
  }

  dump() {
    const {registry, classNameGenerator} = this;

    return {
      id: this.id,
      classGeneratorValue: classNameGenerator.getValue(),
      sheetsClasses: registry.reduce(
        (acc, sheet) => {
          acc[sheet.id] = sheet.classes;
          return acc;
        },
        {},
      ),
      css: registry.reduce(
        (acc, {text}) => acc + text, // eslint-disable-line prefer-template
        '',
      ),
    };
  }
}
