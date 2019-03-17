import * as R from 'ramda';

export const distance = (v1, v2) => {
  let sum = 0;

  for (let i = 0; i < v1.length; ++i) {
    const d = v2[i] - v1[i];
    sum += d * d;
  }

  return Math.sqrt(sum);
};

export const unrollDistance = (w) => {
  const deltaSum = R.join(
    ' + ',
    R.times(
      index => `(d${index} = vec2[${index}] - vec1[${index}]) * d${index}`,
      w,
    ),
  );

  /* eslint-disable no-new-func */
  return new Function(
    'vec1',
    'vec2',
    `
      return Math.sqrt(${deltaSum});
    `,
  );
  /* eslint-enable no-new-func */
};
