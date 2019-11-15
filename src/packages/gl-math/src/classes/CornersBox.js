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
}
