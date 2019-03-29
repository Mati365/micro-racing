import * as R from 'ramda';

import createMeshVertexBuffer from '../../../buffer/types/createMeshVertexBuffer';

const MATCH_FACE_REGEX = /(?:(?<v>[^/]+)(?:\/|$))(?:(?<uv>[^/]*)(?:\/|$))?(?:(?<n>[^/]+)(?:\/|$))?/;

const OBJ_VERTEX_ACCUMULATORS = {
  v: 'vertices',
  vt: 'uv',
  vn: 'normals',
};

const createLoaderDescriptor = () => ({
  vertices: [],
  normals: [],
  uv: [],
  faces: [],
});

const mapToFloats = R.map(Number.parseFloat);

const generateLineTokens = R.compose(
  R.map(
    R.split(' '),
  ),
  R.split('\n'),
);

const mapFaces = R.map(
  face => MATCH_FACE_REGEX.exec(face).groups,
);

const flipUV = ([x, y]) => ([
  x,
  1 - y,
]);

/**
 * Loads OBJ mesh with MTL file
 *
 * @param {String} source
 *
 * @returns {LoaderDescriptor}
 */
const loadOBJ = gl => (source) => {
  const lineTokens = generateLineTokens(source);
  const info = R.reduce(
    (descriptor, [operation, ...args]) => {
      if (operation === 'f') {
        // it might be:
        // f v1 v2 v3
        // f v1/vt1 v2/vt2 v3/vt3
        // f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3
        descriptor.faces.push(...mapFaces(args));
      } else {
        // v, vt, vn
        const accumulator = OBJ_VERTEX_ACCUMULATORS[operation];
        if (accumulator)
          descriptor[accumulator].push(mapToFloats(args));
      }

      return descriptor;
    },
    createLoaderDescriptor(),
    lineTokens,
  );

  const vertices = R.map(
    ({v, uv, n}) => ({
      v: info.vertices[+v - 1],
      uv: flipUV(info.uv[+uv - 1] || [0, 0]),
      n: info.normals[+n - 1],
      mtlIndex: 0,
    }),
    info.faces,
  );

  return {
    vao: createMeshVertexBuffer(gl, vertices),
    textures: [],
    materials: [],
  };
};

export default loadOBJ;
