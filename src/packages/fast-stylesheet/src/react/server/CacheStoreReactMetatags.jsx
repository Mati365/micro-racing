import React from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';

import {
  MAGIC_SSR_STORE_ID_ATTRIB,
  HYDRATION_CACHE_VARIABLE,
} from '../../constants/magicFlags';

import {isEmptyObject} from '../../utils';

export const MAGIC_STYLESHEET_TAG = '%%STYLESHEET%%';

if (typeof document !== 'undefined')
  throw new Error('CacheStoreReactMetatags should be linked only on server side!');

const CacheStoreReactMetatagsContainer = ({hydrationCacheVariable, stores}) => {
  const dumps = stores.map(
    store => (
      store.dump
        ? store.dump()
        : store
    ),
  );

  const storesJSDescription = dumps.reduce(
    (acc, {id, sheetsClasses, classGeneratorValue}) => {
      if (!isEmptyObject(sheetsClasses)) {
        acc[id] = {
          sheetsClasses,
          classGeneratorValue,
        };
      }

      return acc;
    },
    {},
  );

  return (
    <>
      <style
        type='text/css'
        {...{
          [MAGIC_SSR_STORE_ID_ATTRIB]: '',
        }}
        dangerouslySetInnerHTML={{
          __html: dumps.reduce(
            (acc, {css}) => (
              css
                ? acc + css
                : acc
            ),
            '',
          ),
        }}
      />

      <script
        {...{
          [MAGIC_SSR_STORE_ID_ATTRIB]: '',
        }}
        dangerouslySetInnerHTML={{
          __html: `window['${hydrationCacheVariable}'] = ${JSON.stringify(storesJSDescription)};`,
        }}
      />
    </>
  );
};

CacheStoreReactMetatagsContainer.displayName = 'CacheStoreReactMetatagsContainer';

CacheStoreReactMetatagsContainer.propTypes = {
  hydrationCacheVariable: PropTypes.string,
  stores: PropTypes.arrayOf(
    PropTypes.shape(
      {
        dump: PropTypes.func,
        // or if alrady dumped
        sheetsClasses: PropTypes.object,
      },
    ),
  ).isRequired,
};

CacheStoreReactMetatagsContainer.defaultProps = {
  hydrationCacheVariable: HYDRATION_CACHE_VARIABLE,
};

/** Placeholder */
const CacheStoreReactMetatags = () => MAGIC_STYLESHEET_TAG;

CacheStoreReactMetatags.displayName = 'CacheStoreReactMetatags';

CacheStoreReactMetatags.insertToHTML = (stores, html) => {
  const stylesHTML = ReactDOMServer.renderToString(
    <CacheStoreReactMetatagsContainer stores={stores} />,
  );

  return html.replace(MAGIC_STYLESHEET_TAG, stylesHTML);
};

export default CacheStoreReactMetatags;
