import SheetStore from '../SheetStore';
import Sheet from '../Sheet';

export default class SSRSheetStore extends SheetStore {
  // eslint-disable-next-line class-methods-use-this
  createSheet(sheetID, styles, options) {
    return new Sheet(sheetID, styles, options);
  }

  dump() {
    const {registry} = this;

    return {
      id: this.id,
      sheetsClasses: registry.reduce(
        (acc, sheet) => {
          acc[sheet.id] = sheet.classes;
          return acc;
        },
        {},
      ),
      css: registry
        .sort(
          (a, b) => a.index - b.index,
        )
        .reduce(
          (acc, {text}) => acc + text, // eslint-disable-line prefer-template
          '',
        ),
    };
  }
}
