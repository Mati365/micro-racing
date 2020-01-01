import path from 'path';
import consola from 'consola';
import chalk from 'chalk';
import fg from 'fast-glob';
import fs from 'fs';
import * as R from 'ramda';

import BASIC_NEURAL_AI from '@game/server-res/ai/basic-ai.json';

import * as T from '@pkg/neural-network';

import {logFunction} from '@pkg/basic-helpers/decorators/logMethod';
import asyncSequentionalMap from '@pkg/basic-helpers/async/asyncSequentionalMap';

const loadAiRecordingsDirectory = async (
  {
    trainNeural = BASIC_NEURAL_AI,
    dir,
  },
) => {
  const paths = await fg(
    [
      path.join(dir, '*.json'),
    ],
  );

  const loadRecording = async (recordingPath) => {
    const recording = JSON.parse(
      await fs.promises.readFile(recordingPath),
    );

    trainNeural = T.trainNetwork(recording, 0.5, 110000, trainNeural);
  };

  await asyncSequentionalMap(loadRecording, paths);
  return {
    neural: trainNeural,
    paths,
  };
};

export default logFunction(
  (_, result, {dir}) => {
    consola.info(`${chalk.green.bold('loadAiRecordingsDirectory:')} Found track recordings in ${chalk.bold.white(dir)}:`);

    R.forEach(
      (_path) => {
        consola.info(`${chalk.green.bold('+')} ${chalk.white.bold('recording:')} ${path.basename(_path)}`);
      },
      result.paths,
    );
  },
  {
    afterExec: true,
  },
)(loadAiRecordingsDirectory);
