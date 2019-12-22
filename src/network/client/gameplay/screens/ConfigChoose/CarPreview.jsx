import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import {vec3} from '@pkg/gl-math';
import {createIsometricScene} from '@pkg/isometric-renderer';

import CarNode from '../../objects/Car';

const createCarPreview = (
  {
    canvas,
    carType,
    rotateDuration = 5000,
  },
) => {
  const {f, frame} = createIsometricScene(
    {
      aspectRatio: 1.05,
      canvas,
    },
  );

  const buffer = f.createSceneBuffer(
    {
      cameraConfig: {
        viewportOffset: [0, 0.6, 0],
      },
    },
  );
  const carNode = new CarNode(
    {
      f,
      type: carType,
      transform: {
        translate: vec3(0, 0, 0),
        scale: vec3(8, 8, 8),
        rotate: vec3(0, 0, 0.1),
      },
    },
  );

  buffer.createNode(carNode);
  const releaseFrameRenderer = frame(
    {
      update: (interpolation) => {
        if (carNode.body)
          carNode.body.angle = (Date.now() % rotateDuration) / rotateDuration * Math.PI * 2;

        carNode.update(interpolation);
      },

      render: (...args) => {
        buffer.camera.target = carNode;
        buffer.render(...args);
      },
    },
  );

  return () => {
    buffer.release();
    releaseFrameRenderer();
  };
};

const CarPreview = ({carType}) => {
  const canvasRef = useRef(null);

  useEffect(
    () => {
      const {current: node} = canvasRef;
      if (!node)
        return undefined;

      return createCarPreview(
        {
          canvas: canvasRef.current,
          carType,
        },
      );
    },
    [canvasRef.current],
  );

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

CarPreview.displayName = 'CarPreview';

CarPreview.propTypes = {
  carType: PropTypes.oneOf(R.values(CAR_TYPES)),
};

CarPreview.defaultProps = {
  carType: CAR_TYPES.BLUE,
};

export default React.memo(CarPreview);
