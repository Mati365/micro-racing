import * as R from 'ramda';

import {
  generateLineTokens,
  mapToFloats,
} from './utils';

const mapToVec4 = (args) => {
  const array = mapToFloats(args);

  if (array.length < 4) {
    const prevLength = array.length;

    array.length = 4;
    array.fill(1, prevLength, 4);
  }

  return array;
};

const loadMTL = (mtl) => {
  if (!mtl)
    return [];

  const lineTokens = generateLineTokens(mtl);
  const data = R.reduce(
    (acc, [attr, ...args]) => {
      const current = R.last(acc);

      switch (attr) {
        case 'newmtl':
          acc.push(
            {
              name: args[0],
            },
          );
          break;

        case 'Ns': current.shine = Number.parseFloat(args[0]); break;
        case 'Ni': current.opticalDensity = Number.parseFloat(args[0]); break;

        case 'Ka': current.ambient = mapToVec4(args); break;
        case 'Kd': current.diffuse = mapToVec4(args); break;
        case 'Ks': current.specular = mapToVec4(args); break;
        case 'Ke': current.emissiveCoeficient = mapToVec4(args); break;

        case 'd': current.transparent = Number.parseFloat(args[0]); break;

        default:
      }

      return acc;
    },
    [],
    lineTokens,
  );

  delete data.current;
  return data;
};

export default loadMTL;
