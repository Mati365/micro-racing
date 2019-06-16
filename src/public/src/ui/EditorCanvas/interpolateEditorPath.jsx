import * as R from 'ramda';
import {deCasteljau} from '@pkg/beizer-lines';

/**
 * Add more curvy lines to editor map
 *
 *   +0           +1              +2          +3           +4            +5          +6
 * [normal] [handler before]  [handler after] [normal] [handler before] [normal] [handler before]
 *
 * @param {*} config
 * @param {*} path
 */
const interpolateEditorPath = ({
  spacing = 10,
  loop,
  chunkSize = 1,
  selectorFn = R.identity,
}, path) => {
  let points = [];

  for (let j = 0; j < path.length - chunkSize - (+loop); j += chunkSize) {
    points = points.concat(
      deCasteljau(
        {
          spacing,
          points: [
            selectorFn(path[j]), // A
            selectorFn(path[j + chunkSize]), // B
          ],
          handlers: [
            selectorFn(path[j + chunkSize - 1]), // A top handler
            selectorFn(path[j + chunkSize + 1]), // B top handler
          ],
        },
      ),
    );
  }

  // loop, connects last to first
  if (loop) {
    points = points.concat(
      deCasteljau(
        {
          spacing,
          points: [
            selectorFn(path[path.length - chunkSize]), // B
            selectorFn(path[0]), // A
          ],
          handlers: [
            selectorFn(path[path.length - 1]), // A top handler
            selectorFn(path[1]), // B top handler
          ],
        },
      ),
    );
  }

  return points;
};

export default R.curry(interpolateEditorPath);
