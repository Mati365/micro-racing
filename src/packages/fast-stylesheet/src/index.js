/* eslint-disable prefer-template */
import DOMCssSheetStore from './stores/DOMCssSheetStore';

const defaultSheetStore = new DOMCssSheetStore('c0');

const css = (
  classes,
  {
    sheetStore = defaultSheetStore,
  } = {},
) => sheetStore.injectRules(classes);

export const singleClassCSS = (classRules, ...args) => {
  const output = css(
    {
      base: classRules,
    },
    ...args,
  );

  output.className = output.classes.base;
  return output;
};

export default css;
