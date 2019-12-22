/**
 * Creates plain requestAnimation wrapper
 *
 * @param {Function} fn
 */
export const createAnimationFrameRenderer = (
  {
    render,
    update,
    allowLerpUpdate = true,
    updateDelay = 1000 / 30,
    limitFrameTime = 1000 / 60, // 60fps
    raf = window?.requestAnimationFrame,
  },
) => {
  let stop = false;
  let lastFrame = Date.now();
  let updateAcc = 0;

  const interpolate = {
    updateDelay,
    limitFrameTime,

    fixedStepUpdate: null,
    delta: null, // used for inputs, render related stuff
    alpha: null, // lerp interpolation between updates
  };

  const renderFrame = () => {
    if (stop)
      return;

    // do not use timestamp from requestAnimationFrame
    // that function is executed also in server side
    const timestamp = Date.now();

    // calc delta timing to smooth anim
    const deltaTime = Math.min(
      timestamp - lastFrame,
      limitFrameTime,
    );

    lastFrame = timestamp;
    updateAcc += deltaTime;

    // reset updater flags
    interpolate.deltaTime = deltaTime;
    interpolate.timestamp = timestamp;
    interpolate.fixedStepUpdate = false;
    interpolate.lerpUpdate = false;

    // update positions without lerp
    while (updateAcc >= updateDelay) {
      updateAcc -= updateDelay;
      interpolate.fixedStepUpdate = true;

      update && update(interpolate);
    }

    // lerp between frames
    if (allowLerpUpdate) {
      interpolate.delta = deltaTime / limitFrameTime;
      interpolate.alpha = updateAcc / updateDelay;
      interpolate.fixedStepUpdate = false;
      interpolate.lerpUpdate = true;
      update && update(interpolate);
    }

    // exec frame
    render && render(interpolate);

    // request new frame
    raf(renderFrame);
  };

  raf(renderFrame);

  return () => {
    stop = true;
  };
};

/**
 * Create delta time render loop based
 * on window.requestAnimFrame with GL clearing
 *
 * @todo
 *  Add performance measure functions?
 *
 * @param {Function}  fn  Render function
 */
const createDtRenderLoop = gl => ({render, ...config}) => createAnimationFrameRenderer(
  {
    ...config,
    render: (interpolate) => {
      // flush gl
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      render(interpolate);
    },
  },
);

export default createDtRenderLoop;
