import consola from 'consola';
import chalk from 'chalk';
import fs from 'fs';
import * as R from 'ramda';

import {logFunction} from '@pkg/basic-helpers/decorators/logMethod';
import writeJSONToFile from '../writeJSONToFile';

const writeAiPopulation = async ({filename}, population) => {
  let prevPopulation = null;
  try {
    prevPopulation = JSON.parse(await fs.promises.readFile(filename));
    if (prevPopulation && prevPopulation[0]?.score > population[0]?.score)
      return false;
  } catch (e) {} // eslint-disable-line no-empty

  return writeJSONToFile({filename}, population);
};

export default R.compose(
  R.curryN(2),
  logFunction(
    (_, result, {filename}) => {
      consola.info(`${chalk.green.bold('writeAiPopulation:')}${result ? '' : chalk.bold.red(' skip')} writing AI results to ${chalk.bold.white(filename)}!`);
    },
    {
      afterExec: true,
    },
  ),
)(writeAiPopulation);
