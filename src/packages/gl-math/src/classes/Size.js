import vec4 from '../matrix/types/vec4';

export default class Size {
  constructor(w, h, z) {
    this.w = w;
    this.h = h;
    this.z = z;
  }

  toVec() {
    return vec4(this.w, this.h, this.z, 1.0);
  }
}
