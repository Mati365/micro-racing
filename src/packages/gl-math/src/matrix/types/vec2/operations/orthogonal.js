import Vector from '../../../../classes/Vector';

const orthogonal = (v, right) => (
  right
    ? new Vector([v.y, -v.x])
    : new Vector([-v.y, v.x])
);

export default orthogonal;
