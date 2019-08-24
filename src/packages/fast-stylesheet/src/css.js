import createHydratedSheetStore from './createHydratedSheetStore';
import criticalSheetStore from './criticalSheetStore';

export {
  createHydratedSheetStore,
};

export const createSheetAccessors = (storeConstructParams) => {
  const sheetStore = (
    storeConstructParams
      ? createHydratedSheetStore(storeConstructParams)
      : criticalSheetStore
  );

  const css = ::sheetStore.injectRules;

  const singleClassCSS = (classRules, ...args) => {
    const output = sheetStore.injectRules(
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
  css,
  singleClassCSS,
} = createSheetAccessors();

export {
  criticalSheetStore,
  singleClassCSS,
};

export default css;
