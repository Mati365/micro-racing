const MAX_FRAME_RATE = 60;

/**
 * Creates plain requestAnimation wrapper
 *
 * @param {Function} fn
 */
export const createAnimationFrameRenderer = (fn) => {
  const maxFrameTime = 1000 / MAX_FRAME_RATE;
  let lastFrame = null;

  const renderFrame = (timeStamp) => {
    // calc delta timing to smooth anim
    const delay = timeStamp - lastFrame;
    const delta = (
      lastFrame === null
        ? 1
        : Math.min(maxFrameTime, delay) / maxFrameTime
    );
    lastFrame = timeStamp;

    // exec frame
    fn(delta);

    // request new frame
    window.requestAnimationFrame(renderFrame);
  };

  window.requestAnimationFrame(renderFrame);
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
const createDtRenderLoop = gl => fn => createAnimationFrameRenderer(
  (delta) => {
    // flush gl
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    fn(delta);
  },
);

export default createDtRenderLoop;
