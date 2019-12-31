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

  const matrices = {};
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

  const setSceneScale = (scale) => {
    sceneScale = scale;

    matrices.sceneScaling = mat4.from.scaling([
      scale, scale, scale,
    ]);

    matrices.camera = mat4.from.translation([
      0.0, 0.0, 0.2 / scale * 5,
    ]);

    matrices.projection = createIsometricProjection(
      {
        w: canvasDimensions.w,
        h: canvasDimensions.w / aspectRatio,
      },
      canvasDimensions,
    );

    refreshModelProjectionMatrix();
  };

  setSceneScale(sceneScale);

  /**
   * Render loop
   */
  const frame = ({render, update, ...config}) => f.frame(
    {
      ...config,
      update,
      render: interpolate => render(interpolate, matrices.mpMatrix, context),
    },
  );

  return {
    f,
    frame,
    refreshModelProjectionMatrix,
    setSceneScale,
  };
};

export default createIsometricScene;
