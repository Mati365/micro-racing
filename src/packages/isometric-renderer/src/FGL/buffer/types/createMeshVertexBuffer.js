import * as R from 'ramda';

import createBuffer from '../createBuffer';

//      POS             NORMAL          UV           MTL
// {vec3 [f][f][f]}{vec3 [f][f][f]}{vec2 [f][f]}{int [int32]}
export const PACKED_STRUCT_BYTES_LENGTH = 9 * 4;

export const VERTEX_GLSL_LOC = 0;
export const NORMAL_GLSL_LOC = 1;
export const UV_GLSL_LOC = 2;
export const MTL_GLSL_LOC = 3;

export const packVertexDescriptor = ({v, uv, n, materialIndex}) => ([
  ...v,
  ...n,
  ...uv,
  materialIndex || 0,
]);

export const packVertices = R.compose(
  R.unnest,
  R.map(packVertexDescriptor),
);

/**
 * @see
 *  https://stackoverflow.com/a/39684775
 *
 * @param {MeshVertexDescriptor[]}  vertices
 *
 * @example
 *  MeshVertexDescriptor = {
 *    vertex // vec3
 *    normal // vec3
 *    uv // vec2
 *    materialIndex // int
 *  }
 *  totalSize: 12
 */
const createMeshVertexBuffer = (gl, vertices, normalize, usage = gl.STATIC_DRAW) => {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // VBO generate
  const buffer = createBuffer(
    gl,
    {
      data: new Float32Array(
        packVertices(vertices),
      ),
      usage,
    },
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.handle);

  // VEC3 VERTEX
  gl.vertexAttribPointer(VERTEX_GLSL_LOC, 3, gl.FLOAT, false, PACKED_STRUCT_BYTES_LENGTH, 0);
  gl.enableVertexAttribArray(VERTEX_GLSL_LOC);

  // VEC3 NORMAL, offset = 3
  gl.vertexAttribPointer(NORMAL_GLSL_LOC, 3, gl.FLOAT, false, PACKED_STRUCT_BYTES_LENGTH, 3 * 4);
  gl.enableVertexAttribArray(NORMAL_GLSL_LOC);

  // VEC2 UV, offset = 6
  gl.vertexAttribPointer(UV_GLSL_LOC, 2, gl.FLOAT, false, PACKED_STRUCT_BYTES_LENGTH, 6 * 4);
  gl.enableVertexAttribArray(UV_GLSL_LOC);

  // INT MTL_INDEX, offset = 8
  gl.vertexAttribPointer(MTL_GLSL_LOC, 1, gl.FLOAT, false, PACKED_STRUCT_BYTES_LENGTH, 8 * 4);
  gl.enableVertexAttribArray(MTL_GLSL_LOC);

  gl.bindVertexArray(null);

  return {
    components: {
      type: gl.FLOAT,
      count: vertices.length,
    },
    handle: vao,
    vbo: buffer,
  };
};

export default R.curryN(2, createMeshVertexBuffer);
