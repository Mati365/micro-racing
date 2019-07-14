import {mat4} from '@pkg/gl-math/matrix';

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
    sceneScale = 0.125,
  },
) => {
  const f = fgl(canvas);
  const {canvasDimensions} = f.state;

  const matrices = {
    sceneScaling: mat4.from.scaling([
      sceneScale, sceneScale, sceneScale,
    ]),

    camera: mat4.from.translation([
      0.0, 0.0, 0.2 / sceneScale * 5,
    ]),

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
