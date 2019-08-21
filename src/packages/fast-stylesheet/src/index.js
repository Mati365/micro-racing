import DOMCssSheet from './DOMCssSheet';

const css = (
  classes,
  {
    SheetStore,
  } = {
    SheetStore: DOMCssSheet,
  },
) => {
  const sheet = new SheetStore(classes);

  return {
    classes: sheet.injectedClasses,
    sheet,
  };
};

export const singleClassCSS = (classRules, ...args) => {
  const {
    sheet,
    classes: {base: baseClassName},
  } = css(
    {
      base: classRules,
    },
    ...args,
  );

  return {
    sheet,
    className: baseClassName,
  };
};

export default css;
