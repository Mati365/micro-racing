import * as R from 'ramda';

import getIndexByName from '@pkg/basic-helpers/list/getIndexByName';
import createMeshVertexBuffer from '../../../buffer/types/createMeshVertexBuffer';

import loadMTL from './loadMTL';
import {
  generateLineTokens,
  mapToFloats,
} from './utils';

const MATCH_FACE_REGEX = /(?:(?<v>[^/]+)(?:\/|$))(?:(?<uv>[^/]*)(?:\/|$))?(?:(?<n>[^/]+)(?:\/|$))?/;

const OBJ_VERTEX_ACCUMULATORS = {
  v: 'vertices',
  vt: 'uv',
  vn: 'normals',
};

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
const loadOBJ = gl => ({source, mtl}) => {
  const materials = loadMTL(mtl);
  const lineTokens = generateLineTokens(source);

  // due to JS closure it must be object
  const currentMaterial = {
    index: -1,
  };

  const mapFaces = R.map(
    face => ({
      ...MATCH_FACE_REGEX.exec(face).groups,
      materialIndex: currentMaterial.index,
    }),
  );

  const info = R.reduce(
    (descriptor, [operation, ...args]) => {
      if (operation === 'usemtl') {
        // const
        // currentMaterial = material
        currentMaterial.index = getIndexByName(
          args[0],
          materials,
        );
      } else if (operation === 'f') {
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
    {
      vertices: [],
      normals: [],
      uv: [],
      faces: [],
    },
    lineTokens,
  );

  const vertices = R.map(
    ({v, uv, n, materialIndex}) => ({
      v: info.vertices[+v - 1],
      uv: flipUV(info.uv[+uv - 1] || [0, 0]),
      n: info.normals[+n - 1],
      materialIndex,
    }),
    info.faces,
  );

  return {
    vao: createMeshVertexBuffer(gl, vertices),
    materials,

    // todo
    textures: [],
  };
};

export default loadOBJ;
