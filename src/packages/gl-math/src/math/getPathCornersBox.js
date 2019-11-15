import vec2 from '../matrix/types/vec2';
import CornersBox from '../classes/CornersBox';

const getPathCornersBox = (points) => {
  const topLeft = vec2(Infinity, Infinity);
  const bottomRight = vec2(-Infinity, -Infinity);

  for (let i = 0; i < points.length; ++i) {
    const point = points[i];

    topLeft.x = Math.min(point[0], topLeft.x);
    topLeft.y = Math.min(point[1], topLeft.y);

    bottomRight.x = Math.max(point[0], bottomRight.x);
    bottomRight.y = Math.max(point[1], bottomRight.y);
  }

  return new CornersBox(topLeft, bottomRight);
};

export default getPathCornersBox;
