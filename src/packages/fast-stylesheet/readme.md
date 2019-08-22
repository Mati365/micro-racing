# @pkg/fast-stylesheet

> Fast and small CSS in JS implementation with syntax similar to JSS

### Example:

#### Dynamic Rules
*Multiple classes:*
```js
import css fom '@pkg/fast-stylesheet';

const sheet = css(
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

const {classes} = sheet;
classes.exampleClass // => c1
sheet.remove?.(); // removes style tag from DOM, warn: only if dynamic rule
```

*Single class:*
```js
import {singleClassCSS} fom '@pkg/fast-stylesheet';

const sheet = singleClassCSS(
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

sheet.className; // => c1
sheet.remove?.();
```

#### SSR
```jsx
import css, {sheetStore} fom '@pkg/fast-stylesheet';
// or if you want separate styles..
// cache it somewhere in global scope
// it will create <style /> tag in header and watch for hydration
import {createSheetAccessors} fom '@pkg/fast-stylesheet';
const {css, sheetStore} = createSheetAccessors(
  {
    id: 'x',
  }
);

// client or server
const sheet = css(
  {
    exampleClass: {
      color: 'red',
    },
  },
);

// somewhere in express
const content = (
  ReactDOMServer.renderToString(
    <html lang='en'>
      <head>
        <CacheStoreReactProvider store={sheetStore} />
      </head>

      <body>
        ...
      </body>
  )
);
```
