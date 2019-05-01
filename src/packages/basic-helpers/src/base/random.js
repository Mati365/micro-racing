import {vec2} from '@pkg/gl-math/matrix';

/**
 * Returns random int between min and max, includes min and max
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
export const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

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
