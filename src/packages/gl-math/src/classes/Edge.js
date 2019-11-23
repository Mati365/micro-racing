import vec2 from '../matrix/types/vec2';

export default class Edge {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  set from(v) { this.a = v; }

  set to(v) { this.b = v; }

  get from() { return this.a; }

  get to() { return this.b; }

  vectorize() {
    const {a, b} = this;

    return vec2.sub(a, b);
  }

  center() {
    const {a, b} = this;
    return vec2.lerp(0.5, a, b);
  }

  normal(normalize = true) {
    const normal = vec2.orthogonal(
      this.vectorize(),
      true,
    );

    return (
      normalize
        ? vec2.normalize(normal)
        : normal
    );
  }
}