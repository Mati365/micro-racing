import mat4 from './mat4';

import ortho from './ortho';
import viewport from './viewport';
import perspective from './perspective';
import lookAt from './lookAt';
import inverse from './inverse';

import rotation from './creators/rotation';

export default Object.assign(
  mat4,
  {
    ortho,
    viewport,
    perspective,
    lookAt,
    inverse,

    from: {
      ...mat4.from,
      rotation,
    },
  },
);
