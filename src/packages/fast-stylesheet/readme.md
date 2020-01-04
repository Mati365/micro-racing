# @pkg/fast-stylesheet

> Fast and small CSS in JS implementation with syntax similar to JSS

### Example:

#### Dynamic Rules
*Multiple classes:*
```js
import css from '@pkg/fast-stylesheet';

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
import {singleClassCSS} from '@pkg/fast-stylesheet';

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

#### React
### Basic styled tag(non SSR)
```js
import {styled} from '@pkg/fast-stylesheet/src/react';
import GameCanvas from '@game/network/client/gameplay/GameCanvas';

const Container = styled.div(
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',

    '& canvas': {
      margin: [10, 10, 10, 5],
    },

    '@global': {
      '& body, & html': {
        margin: 0,
        padding: 0,
      },
    },
  },
  {
    // see SSR section for critical class
    // critical: true,
    // sheet: sheetStore,
    // index: 1,
  }
);

const RootContainer = () => (
  <Container>
    <GameCanvas
      dimensions={{
        w: 800,
        h: 600,
      }}
    />
  </Container>
);
```

### SSR
```jsx
// APP
import css, {criticalSheetStore} fom '@pkg/fast-stylesheet';
// or if you want separate styles..
// cache it somewhere in global scope
// it will create <style /> tag in header and watch for hydration
// import {createSheetAccessors} fom '@pkg/fast-stylesheet';
// const {css, sheetStore} = createSheetAccessors(
//   {
//     id: 'x',
//   }
// );

// client or server
const sheet = css(
  {
    exampleClass: {
      color: 'red',
    },
  },
  {
    // if true - all styles will be attached to criticalSheetStore during server startup
    // otherwise client must provide SheetStoreContextProvider
    critical: true,
    // sheet: sheetStore,
    // index: 1,
  }
);

// SERVER SIDE
import CacheStoreReactMetatags from '@pkg/fast-stylesheet/src/react/server/CacheStoreReactMetatags';
import {
  criticalSheetStore,
  createHydratedSheetStore,
  SheetStoreContextProvider,
} from '@pkg/fast-stylesheet/src/react';

// use both - critical stylesheet and dynamic generated stylesheet
const cachedCriticalStoreDump = criticalSheetStore.dump();

const handleRequest = (res) => {
  const dynamicSheetStore = createHydratedSheetStore({id: 'd'});

  res.send(
    CacheStoreReactMetatags.insertToHTML(
      [
        cachedCriticalStoreDump,
        dynamicSheetStore,
      ],
      ReactDOMServer.renderToString(
        <html lang='en'>
          <head>
            <CacheStoreReactMetatags />
          </head>

          <body>
            ...
            <div id='hydration-container'>
              <SheetStoreContextProvider value={dynamicSheetStore}>
                <RootContainer />
              </SheetStoreContextProvider>
            </div>
            ...
          </body>
        </html>,
      ),
    ),
  );
};

// CLIENT SIDE HYDRATION
import {
  createHydratedSheetStore,
  SheetStoreContextProvider,
} from '@pkg/fast-stylesheet/src/react';

ReactDOM.render(
  <SheetStoreContextProvider value={createHydratedSheetStore({id: 'd'})}>
    <RootContainer />
  </SheetStoreContextProvider>,
  document.getElementById('hydration-container'),
);
```
