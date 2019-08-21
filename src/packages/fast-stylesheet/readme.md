# @pkg/fast-stylesheet

> Fast and small CSS in JS implementation with syntax similar to JSS

### Example:

*Multiple classes:*
```js
import fastCSS fom '@pkg/fast-stylesheet';

const {classes, node} = css(
  {
    exampleClass: {
      composes: ['d-block'],
      color: 'red',

      '@global': {
        body: {
          background: 'red',
        },
      },

      '& a': {
        color: 'blue',
      },

      '@media (min-width: 600px)': {
        '& > a': {
          opacity: 1,

          '&:hover': {
            opacity: 0,
            margin: [0, 2, 3, 4],
          }
        },
      },
    },
  },
);

classes.exampleClass // => c1
node.remove(); // removes style tag from DOM
```

*Single class:*
```js
import {singleClassCSS} fom '@pkg/fast-stylesheet';

const {className, node} = singleClassCSS(
  {
    composes: ['d-block'],
    color: 'red',

    '& a': {
      color: 'blue',
    },

    '@media (min-width: 600px)': {
      '& > a': {
        opacity: 1,

        '&:hover': {
          opacity: 0,
          margin: [0, 2, 3, 4],
        }
      },
    },
  },
);

className; // => c1
node.remove();
```
