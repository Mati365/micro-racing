import * as R from 'ramda';

const BASE_ALIGN = {
  vec4: {align: 16, size: 16},
  vec3: {align: 16, size: 12},
  vec2: {align: 8, size: 8},
  float: {align: 4, size: 4},
  bool: {align: 4, size: 4},
  int: {align: 4, size: 4},
  mat4: {align: 16, size: 64},

  array: {align: 16}, // same as vec4
  struct: {align: 16}, // samve as vec4
};

/**
 * @returns [name, size]
 */
const MATCH_ARRAY_INDEX_REGEX = /\[(\d+)\]/g;

const isArray = item => item && R.is(Object, item) && 'length' in item;

const getTypeItemsCount = R.juxt(
  [
    R.compose(
      R.nth(0),
      R.match(/^[\w\d]*/),
    ),
    R.compose(
      R.reduce(
        (prev, str) => prev * +str.replace(MATCH_ARRAY_INDEX_REGEX, '$1'),
        1,
      ),
      R.match(MATCH_ARRAY_INDEX_REGEX),
    ),
  ],
);

/**
 * Returns layout structure info about offsets, align, size
 */
const alignOffset = (align, offset) => Math.ceil(offset / align) * align;

const genStructOffsets = (fields, defs) => {
  let offset = 0;
  const offsets = {};

  for (const key in fields) {
    const layoutItem = fields[key];
    const [type, count] = getTypeItemsCount(layoutItem.type || layoutItem);

    // extract {align, size} from type
    // type might be basic type or struct
    let typeDescriptor = BASE_ALIGN[type] || defs[type];
    if (!typeDescriptor)
      throw new Error(`Unknown field ${key} in struct!`);

    if (typeDescriptor.binary)
      typeDescriptor = typeDescriptor.binary;

    // arrays are padded using vec4 size
    if (count !== 1) {
      typeDescriptor.align = BASE_ALIGN.array.align;
      typeDescriptor.size = alignOffset(
        BASE_ALIGN.struct.align,
        typeDescriptor.size,
      );
    }

    const {align, size} = typeDescriptor;
    offset = alignOffset(align, offset);
    offsets[key] = offset;
    offset += size * count;
  }

  const size = alignOffset(BASE_ALIGN.struct.align, offset);
  return {
    align: size,
    size,
    offsets,
  };
};

/**
 * @see {@link https://learnopengl.com/Advanced-OpenGL/Advanced-GLSL}
 */
const parseStruct = ({fields, defs}) => {
  const {size, offsets} = genStructOffsets(
    fields,
    defs || {},
  );

  /**
   * Packs structure into array
   *
   * @param {Object} obj
   * @param {Array} dest
   * @param {Number} offset
   */
  const pack = (obj, dest, offset = 0) => {
    if (!dest)
      dest = new Float32Array(size);

    if (!offset)
      offset = 0;

    // TODO: Unrolling
    for (const key in obj) {
      const keyOffset = offsets[key];
      if (R.isNil(keyOffset))
        continue;

      const value = obj[key];
      const realOffset = offset + (keyOffset / 4);

      if (isArray(value))
        dest.set(value, realOffset);
      else
        dest[realOffset] = value;
    }
    return dest;
  };

  return {
    size,
    offsets,
    fields,
    pack,
  };
};

export default parseStruct;
