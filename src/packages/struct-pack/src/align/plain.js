const BINARY_TYPES = {
  float64: {
    size: 8,
    setter: 'setFloat64',
    getter: 'getFloat64',
    array: 'Float64Array',
  },

  float32: {
    size: 4,
    setter: 'setFloat32',
    getter: 'getFloat32',
    array: 'Float32Array',
  },

  int8: {
    size: 1,
    setter: 'setInt8',
    getter: 'getInt8',
    array: 'Float8Array',
  },

  int16: {
    size: 2,
    setter: 'setInt16',
    getter: 'getInt16',
    array: 'Float16Array',
  },

  int32: {
    size: 4,
    setter: 'setInt32',
    getter: 'getInt32',
    array: 'Int32Array',
  },

  uint16: {
    size: 2,
    setter: 'setUint16',
    getter: 'setUint16',
    array: 'Uint16Array',
  },

  uint32: {
    size: 4,
    setter: 'setUint32',
    getter: 'setUint32',
    array: 'Uint32Array',
  },
};

const parseStruct = ({fields}) => {
  const offsets = {};
  const content = {
    pack: '',
    load: '',
  };

  let offset = 0;

  for (const key in fields) {
    const {type, count, srcPath = key} = fields[key];
    const {size, setter, getter, array} = BINARY_TYPES[type];

    offsets[key] = offset;

    if (count) {
      content.load += `obj.${key} = new ${array}(${count});\n`;

      for (let index = 0; index < count; ++index) {
        content.pack += `view.${setter}(destOffset + ${offset}, obj.${srcPath}[${index}], true);\n`;
        content.load += `obj.${key}[${index}] = view.${getter}(bufferOffset + ${offset}, true);\n`;
        offset += size;
      }
    } else {
      content.pack += `view.${setter}(destOffset + ${offset}, obj.${srcPath}, true);\n`;
      content.load += `obj.${key} = view.${getter}(bufferOffset + ${offset}, true);\n`;
    }

    offset += size;
  }

  /* eslint-disable no-new-func */
  const pack = new Function('obj', 'dest', 'destOffset', `
    destOffset = destOffset || 0;
    const buffer = dest || new ArrayBuffer(${offset});
    const view = new DataView(buffer);

    ${content.pack}

    return buffer;
  `);

  const load = new Function('buffer', 'bufferOffset', 'obj', `
    obj = obj || {};
    bufferOffset = bufferOffset || 0;

    const view = new DataView(buffer);

    ${content.load}

    return obj;
  `);
  /* eslint-enable no-new-func */

  const size = offset;

  /**
   * @param {Function} mapperFn
   * @param {Object[]} items
   *
   * @returns Uint8Array
   */
  const createPackedArrayFrame = (mapperFn, items) => {
    let arrayOffset = 0;
    const buffer = new ArrayBuffer(1 + size * items.length);
    const view = new DataView(buffer);

    view.setInt8(arrayOffset++, items.length);
    for (let i = items.length - 1; i >= 0; --i) {
      pack(mapperFn(items[i]), buffer, arrayOffset);
      arrayOffset += size;
    }

    return new Uint8Array(buffer);
  };

  /**
   * @param {Function} mapperFn
   * @param {Array} frame
   * @param {Boolean} returnArray
   */
  const loadPackedArrayFrame = (mapperFn, frame, returnArray = false) => {
    const view = new DataView(frame);
    const itemsCount = view.getInt8(0);

    let arrayOffset = 1;
    const array = returnArray && new Array(itemsCount);

    for (let i = itemsCount - 1; i >= 0; --i) {
      const value = mapperFn(
        load(frame, arrayOffset),
      );

      if (array)
        array[i] = value;

      arrayOffset += size;
    }

    return array;
  };

  return {
    size,
    offsets,
    pack,
    createPackedArrayFrame,
    loadPackedArrayFrame,
    load,
  };
};

export default parseStruct;
