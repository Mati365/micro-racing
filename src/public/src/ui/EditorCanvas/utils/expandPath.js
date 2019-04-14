
import * as R from 'ramda';
import vec2 from '@pkg/gl-math/matrix/types/vec2';
// import {quadraticBeizer} from './deCasteljau';

/**
 * https://www.youtube.com/watch?v=RF04Fi9OCPc
 * https://javascript.info/bezier-curve
 *
 * @param {*} width
 * @param {*} realPath
 */
const expandPath = (width, path) => {
  const reduced = [];
  // const path = quadraticBeizer({step: 0.1})(realPath);

  for (let i = 0; i < path.length; ++i) {
    const nextPointDelta = (i ? -1 : 1);
    let deltaVec = null;
    if (i - 1 >= 0 && i + 1 < path.length) {
      const d1 = vec2.sub(
        path[i - 1],
        path[i],
      );

      const d2 = vec2.sub(
        path[i],
        path[i + 1],
      );

      deltaVec = vec2(
        (d1.x + d2.x) / 2,
        (d1.y + d2.y) / 2,
      );
    } else {
      deltaVec = vec2.sub(
        path[i + nextPointDelta],
        path[i],
      );
    }

    const orthogonalVec = vec2.normalize(
      vec2.orthogonal(deltaVec),
    );

    reduced.push(
      [
        // right side
        vec2.add(
          path[i],
          vec2.mul(
            width * nextPointDelta,
            orthogonalVec,
          ),
        ),

        // left side
        vec2.add(
          path[i],
          vec2.mul(
            -width * nextPointDelta,
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
