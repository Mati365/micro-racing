import {Edge, vec2} from '@pkg/gl-math';

const getExpandedPathCheckpoints = (
  {
    every = 1,
    scale = [1.0, 1.0],
  } = {},
) => ([leftTrack, rightTrack]) => {
  const edges = [];

  for (let i = 0.0; i < leftTrack.length; i += every) {
    const [a, b] = [leftTrack[i], rightTrack[i]];

    edges.push(
      new Edge(
        vec2(a.x * scale[0], a.y * scale[1]),
        vec2(b.x * scale[0], b.y * scale[1]),
      ),
    );
  }

  return edges;
};

export default getExpandedPathCheckpoints;
