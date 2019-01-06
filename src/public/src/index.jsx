// import ReactDOM from 'react-dom';
// import React from 'react';

import {mat} from '@pkg/gl-math';

// import GameCanvas from './ui/GameCanvas';

const measureExec = fn => () => {
  const t = performance.now();
  const result = fn();
  console.info(performance.now() - t);

  return result;
};

const m1 = mat.create4x4(
  [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 16,
  ],
);

const m2 = mat.create4x4(
  [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 16,
  ],
);

console.log(mat.mul4x4(m1, m2));
measureExec(
  () => {
    for (let i = 1000000; i >= 0; --i)
      mat.mul(m1, m2);
  },
)();

measureExec(
  () => {
    for (let i = 1000000; i >= 0; --i)
      mat.mul4x4(m1, m2);
  },
)();

// console.log(M.mul4x4(m1, m2));
// console.log(M.addMatrix(m1, m2));
// console.log(M.add4x4(m1, m2));

// ReactDOM.render(
//   <GameCanvas
//     dimensions={{
//       width: 640,
//       height: 480,
//     }}
//   />,
//   document.getElementById('app-root'),
// );
