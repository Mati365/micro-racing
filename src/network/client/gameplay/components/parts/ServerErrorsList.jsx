import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {useI18n} from '@ui/i18n';
import {
  Text,
  UnorderedList,
} from '@ui/basic-components/styled';

const ServerErrorsList = ({errors, renderItemFn, ...props}) => {
  const errorsTranslations = useI18n()('game.errors');

  return (
    <UnorderedList {...props}>
      {R.map(
        ({code, message}) => renderItemFn(
          {
            message: message || errorsTranslations[code] || errorsTranslations.undefined,
            code,
          },
        ),
        errors || [],
      )}
    </UnorderedList>
  );
};

ServerErrorsList.displayName = 'ServerErrorsList';

ServerErrorsList.propTypes = {
  renderItemFn: PropTypes.func,
  errors: PropTypes.arrayOf(
    PropTypes.shape(
      {
        code: PropTypes.string,
        message: PropTypes.string,
      },
    ),
  ).isRequired,
};

ServerErrorsList.defaultProps = {
  renderItemFn: ({code, message}) => (
    <Text
      key={`${message}-${code}`}
      type='danger'
      weight={700}
      size='tiny'
    >
      {`(ID: ${code}): ${message}`}
    </Text>
  ),
};

export default ServerErrorsList;
