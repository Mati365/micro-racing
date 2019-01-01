/**
 * Create delta time render loop based on window.requestAnimFrame
 *
 * @todo
 *  Add performance measure functions?
 *
 * @param {Object} state  State passed every frame to render fn
 * @param {Number}  fps
 * @param {Function}  fn  Render function
 */
const createDtRenderLoop = (state, fps = 60) => (fn) => {
  const maxFrameTime = 1000 / fps;
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
    fn(delta, state);
    window.requestAnimationFrame(renderFrame);
  };

  window.requestAnimationFrame(renderFrame);
};

export default createDtRenderLoop;
