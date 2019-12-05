import vec2 from '../matrix/types/vec2';

export default class CornersBox {
  constructor(topLeft, bottomRight) {
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
  }

  get x() { return this.topLeft[0]; }

  get y() { return this.topLeft[1]; }

  get w() { return this.width; }

  get h() { return this.height; }

  get width() {
    const {bottomRight, topLeft} = this;

    return bottomRight[0] - topLeft[0];
  }

  get height() {
    const {bottomRight, topLeft} = this;

    return bottomRight[1] - topLeft[1];
  }

  toBSON() {
    return {
      topLeft: this.topLeft,
      bottomRight: this.bottomRight,
    };
  }

  static fromBSON(box) {
    if (!box)
      return null;

    return new CornersBox(box.topLeft, box.bottomRight);
  }

  scale(scale) {
    return new CornersBox(
      vec2(
        this.topLeft[0] * scale[0],
        this.topLeft[1] * scale[1],
      ),
      vec2(
        this.bottomRight[0] * scale[0],
        this.bottomRight[1] * scale[1],
      ),
    );
  }
}
