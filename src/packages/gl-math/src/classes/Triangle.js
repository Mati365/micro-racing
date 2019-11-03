export default class Triangle {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  toVertexList() {
    const {a, b, c} = this;

    return [
      a,
      b,
      c,
    ];
  }
}
