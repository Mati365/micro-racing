import {getRandomArrayItem} from '@pkg/basic-helpers/base/random';
import Lang from './res';

/**
 * Returns random Adjective-Animal nick
 *
 * @example
 *  Hot Dog
 *  Weird Parrot
 *
 * @param {Object} config
 */
const generateName = ({lang} = {lang: 'eng'}) => {
  const {
    adjectives,
    animals,
  } = Lang[lang];

  return `${getRandomArrayItem(adjectives)} ${getRandomArrayItem(animals)}`;
};

export default generateName;
