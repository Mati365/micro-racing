export default class Vector extends Float32Array {
  get x() { return this[0]; }

  get y() { return this[1]; }

  get z() { return this[2]; }

  get w() { return this[3]; }
}

// unroll operation global scope fix
if (typeof window !== 'undefined')
  window.__Vector = Vector;
else
  global.__Vector = Vector;
