import consola from 'consola';
import chalk from 'chalk';
import * as R from 'ramda';

import {logFunction} from '@pkg/basic-helpers/decorators/logMethod';
import serializeBsonList from '@game/server/utils/serializeBsonList';
import writeJSONToFile from '../writeJSONToFile';

const writeTrackRecording = (config, recording) => writeJSONToFile(
  config,
  serializeBsonList(recording),
);

export default R.compose(
  R.curryN(2),
  logFunction(
    (_, result, {filename}) => {
      consola.info(`${chalk.green.bold('writeTrackRecording')} to ${chalk.bold.red(filename)}!`);
    },
    {
      afterExec: true,
    },
  ),
)(writeTrackRecording);
