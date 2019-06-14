import mat4 from './mat4';

import ortho from './creators/ortho';
import viewport from './creators/viewport';
import perspective from './creators/perspective';
import lookAt from './creators/lookAt';
import inverse from './creators/inverse';
import rotation from './creators/rotation';

import translate from './mutable/translate';
import scale from './mutable/scale';
import rotate from './mutable/rotate';

export default Object.assign(
  mat4,
  {
    ortho,
    viewport,
    perspective,
    lookAt,
    inverse,

    mutable: {
      translate,
      scale,
      rotate,
    },
    from: {
      ...mat4.from,
      rotation,
    },
  },
);
