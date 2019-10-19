import * as R from 'ramda';

export const INNER_ITEM_MATCH_REGEX = /%{([?.\w]*)}/g; // match = 1
export const OUTER_ITEM_MATCH_REGEX = /(%{[?.\w]*})/g; // match = %{1}

/**
 * @param {String} str
 * @param {Any} params
 *
 * @returns {String}
 *
 * @example
 *  format("Dupa %{a} 123", {a: 22})
 *    // => "Dupa 22 123"
 */
const format = (str, params) => {
  let counter = 0;

  return str.replace(
    INNER_ITEM_MATCH_REGEX,
    (group, match) => {
      if (R.is(String, match) && match.length)
        return params[match];

      return params[counter++];
    },
  );
};

/**
 * Fomats string with react components, generally
 * slower than simple format()
 */
const innerItemMatch = R.match(
  new RegExp(INNER_ITEM_MATCH_REGEX.source), // remove g flag
);

export const reactFormat = (str, params) => {
  const tokens = R.split(OUTER_ITEM_MATCH_REGEX, str);
  if (!tokens.length)
    return null;

  let counter = 0;
  return tokens.map(
    (token) => {
      const match = innerItemMatch(token);
      if (match.length) {
        if (R.is(String, match) && match.length)
          return params[match];

        return params[counter++];
      }

      return token;
    },
  );
};

export default format;
