import path from 'path';
import consola from 'consola';
import chalk from 'chalk';
import fg from 'fast-glob';
import fs from 'fs';
import * as R from 'ramda';

import * as T from '@pkg/neural-network';

import BASIC_NEURAL_AI from '@game/server-res/ai/basic-ai.json';

import {logFunction} from '@pkg/basic-helpers/decorators/logMethod';
import {createCarNeuralNetwork} from '@game/network/shared/logic/drivers/neural/CarNeuralAI';
import asyncSequentionalMap from '@pkg/basic-helpers/async/asyncSequentionalMap';

const loadAiRecordingsDirectory = async (
  {
    trainNeural = createCarNeuralNetwork(),
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

    trainNeural = T.trainNetwork(recording, 0.5, 111000, trainNeural);
  };

  asyncSequentionalMap(loadRecording, paths);
  return {
    neural: BASIC_NEURAL_AI,
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
