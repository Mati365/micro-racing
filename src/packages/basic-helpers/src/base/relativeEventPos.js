import {vec2} from '@pkg/gl-math/matrix';

const relativeEventPos = (e) => {
  const bounds = e.target.getBoundingClientRect();

  return vec2(
    e.clientX - bounds.x,
    e.clientY - bounds.y,
  );
};

export default relativeEventPos;
