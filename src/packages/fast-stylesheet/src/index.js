/* eslint-disable prefer-template */
import {IsomorphicSheetStore} from './stores/types';

const defaultSheetStore = new IsomorphicSheetStore('c0');

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
