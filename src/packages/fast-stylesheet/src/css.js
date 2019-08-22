import DEFAULT_STORE from './defaultSheetStore';
import createHydratedSheetStore from './createHydratedSheetStore';

export const createSheetAccessors = (storeConstructParams) => {
  const sheetStore = (
    storeConstructParams
      ? createHydratedSheetStore(storeConstructParams)
      : DEFAULT_STORE
  );

  const css = (
    classes,
    {
      index = null,
    } = {},
  ) => sheetStore.injectRules(classes, index);

  const singleClassCSS = (classRules, ...args) => {
    const output = css(
      {
        base: classRules,
      },
      ...args,
    );

    output.className = output.classes.base;
    return output;
  };

  return {
    sheetStore,
    css,
    singleClassCSS,
  };
};

const {
  sheetStore,
  css,
  singleClassCSS,
} = createSheetAccessors();

export {
  sheetStore,
  singleClassCSS,
};

export default css;
