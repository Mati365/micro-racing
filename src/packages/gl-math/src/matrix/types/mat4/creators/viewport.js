import mat4 from '../mat4';

/**
 * Creates blank viewport matrix
 *
 * @see
 *  {@link} http://www.3dcpptutorials.sk/index.php?id=2
 *
 * @param {Object}  config
 * @returns {Matrix}
 *
 * @export
 */
const viewport = ({x, y, w, h}) => mat4(
  [
    w, 0, 0, x,
    0, h, 0, y,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ],
);

export default viewport;
