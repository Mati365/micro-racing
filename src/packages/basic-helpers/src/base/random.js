import * as R from 'ramda';
import {vec2} from '@pkg/gl-math/matrix';

/**
 * Returns random int between min and max, <min, max), casts to int
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
export const getRandomNumber = (min, max) => Number.parseInt(
  Math.floor(Math.random() * (max - min)) + min,
  10,
);

/**
 * Returns random float between min and max, includes <min, max)
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
export const getRandomFloatNumber = (min, max) => (Math.random() * (max - min)) + min;

/**
 * Gets random number between: [min, max] not (min, max)
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
export const getRandomIntInclusive = (min, max) => {
  const [_min, _max] = [Math.floor(min), Math.ceil(max)];

  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
};

/**
 * Returns random element from array
 *
 * @param {Array} array
 *
 * @returns {Any}
 */
export const getRandomArrayItem = (array) => {
  if (array.length > 0)
    return array[getRandomIntInclusive(0, array.length - 1)];

  return null;
};

/**
 * Gets array of points on certain area
 *
 * @param {Size} areaSize
 * @param {Point} border
 *
 * @returns {Array[]} points
 */
export const getRandomPoint = (border, areaSize) => {
  const cx = areaSize.w / 2;
  const cy = areaSize.h / 2;

  return vec2(
    cx + getRandomIntInclusive(-cx + border.x, cx - border.x),
    cy + getRandomIntInclusive(-cy + border.y, cy - border.y),
  );
};

/**
 * Returns random value from object
 *
 * @param {Object} obj
 * @returns {Any}
 */
export const getRandomObjValue = (obj) => {
  const objKey = getRandomArrayItem(
    R.keys(obj),
  );

  return obj[objKey];
};
