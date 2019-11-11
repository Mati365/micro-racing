/**
 * Smallest angle distance
 *
 * @see
 *  {@link https://stackoverflow.com/a/2007279/6635215}
 */
const smallestAngleDistance = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export default smallestAngleDistance;
