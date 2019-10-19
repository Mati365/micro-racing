import React from 'react';
import PropTypes from 'prop-types';

export const DEFAULT_GLOBAL_JSON_NAME = '__hydrate';

const ProvideGlobalJSON = ({globalVariableName, value}) => (
  <script
    dangerouslySetInnerHTML={{
      __html: `window['${globalVariableName}'] = ${JSON.stringify(value)}`,
    }}
  />
);

ProvideGlobalJSON.propTypes = {
  globalVariableName: PropTypes.string,
  value: PropTypes.any.isRequired,
};

ProvideGlobalJSON.defaultProps = {
  globalVariableName: DEFAULT_GLOBAL_JSON_NAME,
};

export default ProvideGlobalJSON;
