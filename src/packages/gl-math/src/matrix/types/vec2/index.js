import createVectorOptimizedOperations from '../createVectorOptimizedOperations';

// fixme: propably circular dependency
import vec3 from '../vec3';
import vec4 from '../vec4';

import dot from './operations/dot';
import rotate from './operations/rotate';
import orthogonal from './operations/orthogonal';
import fromScalar from './operations/fromScalar';
import angleBetweenPoints from './operations/angleBetweenPoints';
import vectorAngle from './operations/vectorAngle';
import reflectByNormal from './operations/reflectByNormal';
import sumDistances from './operations/sumDistances';

const vec2 = createVectorOptimizedOperations(
  2,
  {
    dot,
    rotate,
    orthogonal,
    fromScalar,
    angleBetweenPoints,
    vectorAngle,

    zero: () => vec2(0, 0),
    toVec3(vec, z = 0.0) { return vec3(vec[0], vec[1], z); },
    toVec4(vec, z = 0.0, w = 1.0) { return vec4(vec[0], vec[1], z, w); },
  },
);

vec2.reflectByNormal = reflectByNormal(vec2);
vec2.sumDistances = sumDistances(vec2);

export default vec2;
