import {mat4} from '@pkg/gl-math/matrix';
import getDOMElementSize from '@pkg/basic-helpers/base/getDOMElementSize';

import fgl from './FGL';
import createIsometricProjection from './FGL/core/viewport/projections/createIsometricProjection';

/**
 * Creates FGL instance that makes viewport isometric,
 * handles matrices stuff etc
 */
const createIsometricScene = (
  {
    canvas,
    aspectRatio,
  },
) => {
  const f = fgl(canvas);
  const canvasDimensions = getDOMElementSize(canvas);

  const matrices = {
    sceneScaling: mat4.from.scaling([0.2, 0.2, 0.2]),
    camera: mat4.from.translation([0.0, 0.0, 5.0]),

    projection: createIsometricProjection(
      {
        w: canvasDimensions.w,
        h: canvasDimensions.w / aspectRatio,
      },
      canvasDimensions,
    ),
  };

  const context = {
    f,
    matrices,
  };

  /**
   * Setting up MP matrix
   */
  const refreshModelProjectionMatrix = () => {
    matrices.mpMatrix = mat4.compose.mul(
      matrices.camera,
      matrices.sceneScaling,
      matrices.projection,
    );
  };
  refreshModelProjectionMatrix();

  /**
   * Render loop
   */
  const frame = (fn) => {
    f.frame(
      delta => fn(delta, matrices.mpMatrix, context),
    );
  };

  return {
    f,
    frame,
  };
};

export default createIsometricScene;
