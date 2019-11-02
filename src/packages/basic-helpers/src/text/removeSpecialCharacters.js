import * as R from 'ramda';

const removeSpecialCharacters = R.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '');

export default removeSpecialCharacters;
