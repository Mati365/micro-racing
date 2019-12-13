export default class Vector extends Float32Array {
  get x() { return this[0]; }

  get y() { return this[1]; }

  get z() { return this[2]; }

  get w() { return this[3]; }

  set x(v) { this[0] = v; }

  set y(v) { this[1] = v; }

  set z(v) { this[2] = v; }

  set w(v) { this[3] = v; }

  /* eslint-disable prefer-destructuring */
  set xy(vec) {
    this[0] = vec[0];
    this[1] = vec[1];
  }

  set xyz(vec) {
    this[0] = vec[0];
    this[1] = vec[1];
    this[2] = vec[2];
  }
  /* eslint-enable prefer-destructuring */

  equals(a) {
    return (
      this[0] === a[0]
        && this[1] === a[1]
        && this[2] === a[2]
        && this[3] === a[3]
    );
  }

  toBSON() {
    return Array.from(this);
  }

  static fromArray(arr) {
    return new Vector(arr);
  }

  // unsafe
  static ZERO = new Vector([0, 0, 0, 0]);
}

// unroll operation global scope fix
if (typeof window !== 'undefined')
  window.__Vector = Vector;
else
  global.__Vector = Vector;
