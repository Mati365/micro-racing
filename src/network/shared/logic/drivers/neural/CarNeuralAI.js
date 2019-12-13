import * as R from 'ramda';
import * as T from '@pkg/neural-network';

import {MAX_CAR_SPEED} from '../../physics/CarPhysicsBody';
import CarIntersectRays from './CarIntersectRays';

const NEURAL_CAR_INPUTS = {
  SPEED_INPUT: 0,
  ANGLE_INPUT: 1,
};

const NEURAL_CAR_OUTPUTS = {
  SPEED_INPUT: 0,
  TURN_INPUT: 1,
};

const createTanH = T.createLayer(T.NEURAL_ACTIVATION_TYPES.TAN_H);

/**
 * Creates basic game neural network
 *
 * @param {Number} raysCount
 *
 * @returns {NeuralNetwork}
 */
const createCarNeuralNetwork = (raysCount) => {
  const inputCount = raysCount + R.keys(NEURAL_CAR_INPUTS).length;
  const outputsCount = R.keys(NEURAL_CAR_OUTPUTS).length;

  return T.createNeuralNetwork([
    T.createInputLayer(inputCount),
    createTanH(
      Math.floor(inputCount * 2 / 3) + outputsCount,
    ),
    createTanH(outputsCount),
  ]);
};

export default class CarNeuralAI {
  constructor(
    {
      raysCount = 7,
      neural,
      car,
    } = {},
  ) {
    this.car = car;
    this.neural = neural || createCarNeuralNetwork(raysCount);
    this.intersections = new CarIntersectRays(
      car.body,
      {
        viewDistance: 3,
        raysCount,
      },
    );
  }

  drive({physics}) {
    const {
      car: {body},
      intersections,
      neural,
    } = this;

    // neural control
    intersections.update(physics);
    const neuralOutput = T.exec(
      [
        body.speed / MAX_CAR_SPEED, // nornalize speed
        (body.steerAngle / body.maxSteerAngle) * 3,
        ...R.map(
          (intersection) => {
            if (!intersection)
              return 0;

            return (1 - intersection.uB) * 3;
          },
          intersections.pickRaysClosestIntersects(),
        ),
      ],
      neural,
    );

    body.speedUp(Math.abs(neuralOutput[0]) * 20);
    body.turnSteerWheels(neuralOutput[1]);
  }
}
