import {vec4} from '@pkg/gl-math';

const hexToVec4 = (hex, normalize = true, a = 255) => {
  let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));

  if (normalize) {
    r /= 255;
    g /= 255;
    b /= 255;
    a /= 255;
  }

  return vec4(r, g, b, a);
};

export default hexToVec4;
