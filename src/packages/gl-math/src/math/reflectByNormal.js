import {vec2} from '@pkg/gl-math';

/**
 * Flip vector on normal
 *
 * @see
 *  {@link https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector}
 */
const reflectByNormal = (normal, vector, normalized) => {
  const normalizedNormal = (
    normalized
      ? normal
      : vec2.normalize(normal)
  );

  return vec2.sub(
    vector,
    vec2.mul(
      2 * vec2.dot(vector, normalizedNormal),
      normalizedNormal,
    ),
  );
};

export default reflectByNormal;
