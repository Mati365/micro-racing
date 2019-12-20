import React from 'react';
import c from 'classnames';

import createUseCSSHook from './hooks/createUseCSSHook';
import omitProps from '../utils/omitProps';

const styled = (Tag, classes, params = {}) => {
  const {classSelector, omitProps: omittedProps} = params;
  const useCSS = createUseCSSHook(
    classes,
    params,
  );

  const Wrapped = React.forwardRef(({className, tag, ...props}, ref) => {
    const Component = tag || Tag;
    const injectedClasses = useCSS().classes;

    let generatedClassName = injectedClasses.base;
    if (classSelector)
      generatedClassName += ' ' + c(classSelector(injectedClasses, props)); // eslint-disable-line prefer-template

    if (className)
      generatedClassName += ' ' + className; // eslint-disable-line prefer-template

    return (
      <Component
        {...params.props}
        {...(
          omittedProps
            ? omitProps(omittedProps, props)
            : props
        )}
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
  'img', 'canvas', 'form',
].forEach(
  (tag) => {
    styled[tag] = (classes, params) => styled(tag, classes, params);
  },
);

export default styled;
