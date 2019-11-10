import {Edge} from '@pkg/gl-math';

const getVerticesNormals = (vertices) => {
  const {length} = vertices;

  if (length < 2)
    return [];

  const normals = [];
  for (let i = 0; i < length; ++i) {
    const nextIndex = (i + 1) % length;
    const edge = new Edge(
      vertices[i],
      vertices[nextIndex],
    );

    normals.push(
      {
        normal: edge.normal(),
        src: edge.center(),
        edge,
      },
    );
  }

  return normals;
};

export default getVerticesNormals;
