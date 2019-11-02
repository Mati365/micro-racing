import {BrowserRouter} from 'react-router-dom';
import {StaticRouter} from 'react-router';

import {ssr} from '@pkg/basic-helpers';

export default (
  ssr
    ? StaticRouter
    : BrowserRouter
);
