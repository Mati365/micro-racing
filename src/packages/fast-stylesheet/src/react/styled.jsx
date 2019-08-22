import React from 'react';
import css from '../css';

const styled = (Tag, classes) => {
  if (!classes.base) {
    classes = {
      base: classes,
    };
  }

  const {classes: injectedClasses} = css(classes);
  const Wrapped = ({className, ...props}) => {
    let generatedClassName = injectedClasses.base;
    if (className)
      generatedClassName += ' ' + className; // eslint-disable-line prefer-template

    return (
      <Tag
        {...props}
        className={generatedClassName}
      />
    );
  };

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
    styled[tag] = classes => styled(tag, classes);
  },
);

export default styled;
