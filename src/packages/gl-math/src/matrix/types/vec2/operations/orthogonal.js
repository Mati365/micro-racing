import Vector from '../../../../classes/Vector';

const orthogonal = v => new Vector([-v.y, v.x]);

export default orthogonal;
