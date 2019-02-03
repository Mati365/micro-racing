import mat4 from './mat4';

/**
 * @see {@link https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function}
 * @see {@link https://stackoverflow.com/a/6802424}
 */
const lookAt = ({
  eye,
  to,
}) => {
  const a = 2;

  return mat4([
    a,
    eye,
    to,
  ]);
};

export default lookAt;
