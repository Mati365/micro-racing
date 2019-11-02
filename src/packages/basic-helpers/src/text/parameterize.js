import * as R from 'ramda';

import escapeDiacritics from './escapeDiacritics';
import removeSpecialCharacters from './removeSpecialCharacters';

export const separatedParameterize = separator => R.ifElse(
  R.either(
    R.isNil,
    R.isEmpty,
  ),
  R.always(''),
  R.compose(
    R.replace(/\s/g, separator),
    R.toLower,
    escapeDiacritics,
    removeSpecialCharacters,
    R.trim,
  ),
);

export default separatedParameterize('-');
