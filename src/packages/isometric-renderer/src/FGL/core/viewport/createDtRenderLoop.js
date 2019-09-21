/**
 * Creates plain requestAnimation wrapper
 *
 * @param {Function} fn
 */
export const createAnimationFrameRenderer = ({
  render,
  update,
  updateDelay = 1000 / 30, // 30 fps
  limitFrameTime = 1000 / 60, // 60fps
  raf = window?.requestAnimationFrame,
}) => {
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

    // update every frame but e.g physics
    // only 30fps per second
    if (updateAcc >= updateDelay) {
      updateAcc -= updateDelay;
      interpolate.fixedStepUpdate = true;
    } else
      interpolate.fixedStepUpdate = false;

    // save timestamp
    interpolate.timestamp = timestamp;

    // used for inputs etc.
    interpolate.delta = deltaTime / limitFrameTime;

    // used for interpolation between renderer states
    interpolate.alpha = updateAcc / updateDelay;

    // exec frame update
    update && update(interpolate);

    // exec frame
    render && render(interpolate);

    // request new frame
    raf(renderFrame);
  };

  raf(renderFrame);
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
