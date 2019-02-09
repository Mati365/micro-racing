import mat4 from './mat4';

import ortho from './ortho';
import viewport from './viewport';
import perspective from './perspective';
import lookAt from './lookAt';

export default Object.assign(
  mat4,
  {
    ortho,
    viewport,
    perspective,
    lookAt,
  },
);
