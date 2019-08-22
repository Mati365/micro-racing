import React from 'react';
import PropTypes from 'prop-types';

import {
  MAGIC_HYDRATED_STORE_ID_ATTRIB,
  HYDRATION_CACHE_VARIABLE,
} from '../constants/magicFlags';

const CacheStoreReactProvider = ({hydrationCacheVariable, store}) => {
  const {id, sheetsClasses, classGeneratorValue, css} = store.dump();

  return [
    <style
      key='style-tag'
      type='text/css'
      {...{
        [MAGIC_HYDRATED_STORE_ID_ATTRIB]: id,
      }}
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />,

    <script
      key='script-tag'
      {...{
        [MAGIC_HYDRATED_STORE_ID_ATTRIB]: id,
      }}
      dangerouslySetInnerHTML={{
        __html: `window['${hydrationCacheVariable}'] = ${JSON.stringify({
          [id]: {
            sheetsClasses,
            classGeneratorValue,
          },
        })};`,
      }}
    />,
  ];
};

CacheStoreReactProvider.displayName = 'CacheStoreReactProvider';

CacheStoreReactProvider.propTypes = {
  hydrationCacheVariable: PropTypes.string,
  store: PropTypes.shape(
    {
      dump: PropTypes.func.isRequired,
    },
  ).isRequired,
};

CacheStoreReactProvider.defaultProps = {
  hydrationCacheVariable: HYDRATION_CACHE_VARIABLE,
};

export default CacheStoreReactProvider;
