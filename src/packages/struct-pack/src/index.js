import * as R from 'ramda';

import * as AlignPackers from './align';

export const toGLSLTypeDef = R.compose(
  R.reduce(
    (acc, [key, value]) => (
      `${acc} ${value.type || value} ${key};\n`
    ),
    '',
  ),
  R.toPairs,
  ({binary: {fields}}) => fields,
);

/**
 * @param {Object} config
 *
 * @example
 *  align = std140
 *  fields = {
 *    field: {type: 'vec2', offset?: 0, size?: 2}
 *  }
 */
const packStruct = ({
  align = 'std140',
  wrapToType = true,
  fields,
  defs,
}) => (ParentStruct) => {
  const alignPack = AlignPackers[align];

  const descriptor = alignPack(
    {
      fields,
      defs,
    },
  );
  if (!wrapToType)
    return descriptor;

  const mergeWithDefaults = R.mergeRight(
    R.mapObjIndexed(R.prop('default'), fields),
  );

  return class extends ParentStruct {
    constructor(data) {
      super(data);
      Object.assign(
        this,
        mergeWithDefaults(data),
      );
    }

    static binary = descriptor;

    pack(dest, offset) {
      return descriptor.pack(this, dest, offset);
    }
  };
};

export const createPackedStruct = (...args) => packStruct(...args)(class {});

export default packStruct;
