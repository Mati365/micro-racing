import * as R from 'ramda';

import {getNetworkOutput} from './network';
import unsafeForwardPropagate from './unsafe/forwardPropagate';

const execInput = R.compose(
  getNetworkOutput,
  unsafeForwardPropagate,
);

export default execInput;
