import React from 'react';
import createUseCSSHook from './hooks/createUseCSSHook';

const styled = (Tag, classes, params) => {
  const useCSS = createUseCSSHook(
    classes,
    params || {},
  );

  const Wrapped = React.forwardRef(({className, ...props}, ref) => {
    const injectedClasses = useCSS().classes;

    let generatedClassName = injectedClasses.base;
    if (className)
      generatedClassName += ' ' + className; // eslint-disable-line prefer-template

    return (
      <Tag
        {...props}
        ref={ref}
        className={generatedClassName}
      />
    );
  });

  Wrapped.displayName = 'Styled';

  return Wrapped;
};

[
  'input', 'textarea', 'button',
  'div', 'span',
  'a', 'table', 'td',
  'ul', 'li', 'ol',
  'header', 'section',
  'article', 'footer',
  'img',
].forEach(
  (tag) => {
    styled[tag] = (classes, params) => styled(tag, classes, params);
  },
);

export default styled;
