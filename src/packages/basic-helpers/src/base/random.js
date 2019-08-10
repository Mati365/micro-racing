import {vec2} from '@pkg/gl-math/matrix';

/**
 * Returns random int between min and max, includes min and max
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
export const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

/**
 * Returns random element from array
 *
 * @param {Array} array
 *
 * @returns {Any}
 */
export const getRandomArrayItem = (array) => {
  if (array.length > 0)
    return array[getRandomNumber(0, array.length - 1)];

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
    cx + getRandomNumber(-cx + border.x, cx - border.x),
    cy + getRandomNumber(-cy + border.y, cy - border.y),
  );
};
