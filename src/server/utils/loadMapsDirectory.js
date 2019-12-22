import path from 'path';
import consola from 'consola';
import chalk from 'chalk';
import fg from 'fast-glob';
import fs from 'fs';
import pako from 'pako';
import * as R from 'ramda';

import {logFunction} from '@pkg/basic-helpers/decorators/logMethod';
import asyncSequentionalMap from '@pkg/basic-helpers/async/asyncSequentionalMap';

import PrerenderedLayerMap from '@game/network/server/PrerenderedLayerMap';

const loadMapsDirectory = async ({dir}) => {
  const paths = await fg([path.join(dir, '*.gzip')]);

  return asyncSequentionalMap(
    async mapPath => R.compose(
      PrerenderedLayerMap.fromBSON,
      pako.inflate,
    )(
      await fs.promises.readFile(mapPath),
    ),
    paths,
  );
};

export default logFunction(
  (_, result, {dir}) => {
    consola.info(`${chalk.green.bold('loadMapsDirectory:')} Found maps in ${chalk.bold.white(dir)}:`);

    R.forEach(
      map => consola.info(`${chalk.green.bold('+')} ${chalk.white.bold('name:')} ${map.meta?.title}`),
      result,
    );
  },
  {
    afterExec: true,
  },
)(loadMapsDirectory);
