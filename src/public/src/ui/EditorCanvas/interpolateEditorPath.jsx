import {deCasteljau} from '@pkg/beizer-lines';

import {CHUNK_SIZE} from './Track';

/**
 * Add more curvy lines to editor map
 *
 *   +0           +1              +2          +3           +4            +5          +6
 * [normal] [handler before]  [handler after] [normal] [handler before] [normal] [handler before]
 *
 * @param {*} config
 * @param {*} path
 */
const interpolateEditorPath = ({step, loop}, path) => {
  let points = [];

  for (let j = 0; j < path.length - CHUNK_SIZE; j += CHUNK_SIZE) {
    points = points.concat(
      deCasteljau(
        {
          step,

          points: [
            path[j].point, // A
            path[j + CHUNK_SIZE].point, // B
          ],

          handlers: [
            path[j + CHUNK_SIZE - 1].point, // A top handler
            path[j + CHUNK_SIZE + 1].point, // B top handler
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
          step,

          points: [
            path[path.length - CHUNK_SIZE].point, // B
            path[0].point, // A
          ],

          handlers: [
            path[path.length - 1].point, // A top handler
            path[1].point, // B top handler
          ],
        },
      ),
    );
  }

  return points;
};

export default interpolateEditorPath;
