import * as R from 'ramda';

import getIndexByName from '@pkg/basic-helpers/list/getIndexByName';

import loadMTL from './loadMTL';
import {
  generateLineTokens,
  mapToFloats,
} from './utils';

import {MeshMaterial} from '../../../materials/createMaterialMeshMaterial';
import MeshVertexResource from '../types/MeshVertexResource';

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
const loadOBJ = ({
  source,
  mtl,
  normalize, // w, h, z
  axis = [1, 1, 1],
}) => {
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

  // todo: Move to separate methods?
  // create borders
  const corners = {
    topLeft: [Infinity, -Infinity, -Infinity],
    bottomRight: [-Infinity, Infinity, Infinity],
  };

  const {
    topLeft,
    bottomRight,
  } = corners;

  const vertices = R.map(
    ({v, uv, n, materialIndex}) => {
      const vertex = info.vertices[+v - 1];

      // TOP LEFT
      topLeft[0] = Math.min(topLeft[0], vertex[0]);
      topLeft[1] = Math.max(topLeft[1], vertex[1]);
      topLeft[2] = Math.max(topLeft[2], vertex[2]);

      // BOTTOM LEFT
      bottomRight[0] = Math.max(bottomRight[0], vertex[0]);
      bottomRight[1] = Math.min(bottomRight[1], vertex[1]);
      bottomRight[2] = Math.min(bottomRight[2], vertex[2]);

      return {
        v: [
          vertex[0] * axis[0],
          vertex[1] * axis[1],
          vertex[2] * axis[2],
        ],
        uv: flipUV(info.uv[+uv - 1] || [0, 0]),
        n: info.normals[+n - 1],
        materialIndex,
      };
    },
    info.faces,
  );

  // normalize vertices
  let size = {
    w: bottomRight[0] - topLeft[0],
    h: topLeft[1] - bottomRight[1],
    z: topLeft[2] - bottomRight[2],
  };

  if (normalize) {
    const normalizeSize = size[normalize];
    size = {
      w: size.w / normalizeSize,
      h: size.h / normalizeSize,
      z: size.z / normalizeSize,
    };

    for (let i = vertices.length - 1; i >= 0; --i) {
      const vertex = vertices[i];
      vertex.v = [
        vertex.v[0] / normalizeSize,
        vertex.v[1] / normalizeSize,
        vertex.v[2] / normalizeSize,
      ];
    }
  }

  return new MeshVertexResource(
    {
      materials: materials.map(material => new MeshMaterial(material)),
      textures: [],
      normalized: normalize,
      vertices,
      size,
    },
  );
};

export default loadOBJ;
