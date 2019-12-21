import {vec2} from '@pkg/gl-math/matrix';

const relativeEventPos = (e, scale = 1) => {
  const bounds = e.target.getBoundingClientRect();

  return vec2(
    (e.clientX - bounds.x) * scale,
    (e.clientY - bounds.y) * scale,
  );
};

export default relativeEventPos;
