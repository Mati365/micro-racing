import * as R from 'ramda';

/**
 * Simple hack for inline syntax hightlighting in some IDE
 */
const glsl = (strings, ...values) => (
  R.addIndex(R.reduce)(
    (prev, string, index) => `${prev}${string}${R.defaultTo('', values[index])}`,
    '',
    strings,
  )
);

export default glsl;
