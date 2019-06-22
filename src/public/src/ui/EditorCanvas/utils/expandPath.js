import * as R from 'ramda';

import vec2 from '@pkg/gl-math/matrix/types/vec2';

/**
 * @param {Number} width
 * @param {Vec2[]} path
 */
const expandPath = (width, path) => {
  const reduced = [];
  if (path.length < 3)
    return reduced;

  for (let i = 0; i < path.length; ++i) {
    let deltaVec = null;

    const d1 = vec2.sub(
      i - 1 < 0 ? path[path.length - 1] : path[i - 1],
      path[i],
    );

    const d2 = vec2.sub(
      path[i],
      i + 1 >= path.length ? path[0] : path[i + 1],
    );

    deltaVec = vec2(
      (d1.x + d2.x) / 2,
      (d1.y + d2.y) / 2,
    );

    const orthogonalVec = vec2.normalize(
      vec2.orthogonal(deltaVec),
    );

    reduced.push(
      [
        // inner
        vec2.sub(
          path[i],
          vec2.mul(
            -width,
            orthogonalVec,
          ),
        ),

        // outer
        vec2.add(
          path[i],
          vec2.mul(
            -width,
            orthogonalVec,
          ),
        ),
      ],
    );
  }

  return [
    R.map(R.nth(0), reduced),
    R.map(R.nth(1), reduced),
  ];
};

export default expandPath;
