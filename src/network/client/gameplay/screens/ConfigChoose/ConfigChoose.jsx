import React, {useMemo} from 'react';
import PropTypes from 'prop-types';

import generateName from '@pkg/name-generator';

import {useI18n} from '@ui/i18n';
import {useInputs} from '@ui/basic-hooks';
import {
  Margin,
  Text,
} from '@ui/basic-components/styled';

import {
  GameDivider,
  GameButton,
  GameInput,
} from '../../components/ui';

const ConfigChoose = ({onConfigSet}) => {
  const t = useI18n('game.screens.choose_config');
  const {l, value} = useInputs(
    {
      initialData: {
        nick: useMemo(generateName, []),
      },
    },
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfigSet(value);
      }}
    >
      <GameDivider
        spacing='medium'
        type='dashed'
      />

      <Text
        type='white'
        weight={900}
        style={{
          fontSize: '20px',
        }}
      >
        {t('headers.nick')}
      </Text>

      <Margin
        top={4}
        block
      >
        <GameInput
          {...l.input('nick')}
          required
        />
      </Margin>

      <Margin
        top={3}
        block
      >
        <GameButton
          type='red'
          expanded
        >
          {t('play')}
        </GameButton>
      </Margin>
    </form>
  );
};

ConfigChoose.displayName = 'ConfigChoose';

ConfigChoose.propTypes = {
  // eslint-disable-next-line react/require-default-props,react/no-unused-prop-types
  client: PropTypes.object,
  onConfigSet: PropTypes.func.isRequired,
};

export default ConfigChoose;
