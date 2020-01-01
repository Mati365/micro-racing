import {createLowLatencyObservable} from '@pkg/basic-helpers';

import CarIntersectRays from './CarIntersectRays';
import CarNeuralAI, {
  NEURAL_CAR_OUTPUTS,
  DEFAULT_RAYS_SETTINGS,
} from './CarNeuralAI';

export class CarTrackRecordItem {
  constructor(inputs, body) {
    this.inputs = inputs;
    this.outputs = [];

    // fixme, it should be scaled to NEURAL_OUTPUT_SCALE
    this.outputs[NEURAL_CAR_OUTPUTS.THROTTLE_OUTPUT] = body.throttle / body.maxThrottle;
    this.outputs[NEURAL_CAR_OUTPUTS.TURN_OUTPUT] = body.lastSteerAngleDelta / body.maxSteerAngle;
  }

  toBSON() {
    const {inputs, outputs} = this;

    return {
      inputs,
      outputs,
    };
  }
}

export default class CarTrackRecorder {
  constructor(
    {
      raysSettings = DEFAULT_RAYS_SETTINGS,
    } = {},
  ) {
    this.batch = [];
    this.raysSettings = raysSettings;
    this.observers = {
      recordedCar: createLowLatencyObservable(null),
    };
  }

  clear() {
    this.batch = [];
  }

  record({body, physics}) {
    const {raysSettings, batch} = this;
    body.__tracker = body.__tracker || {
      intersections: new CarIntersectRays(body, raysSettings),
    };

    const {intersections} = body.__tracker;
    intersections.update(physics, false);

    batch.push(
      new CarTrackRecordItem(
        CarNeuralAI.getNeuralInputs(body, intersections),
        body,
      ),
    );
  }

  flush() {
    this.observers.recordedCar.notify(this.batch);
    this.clear();
  }
}
