import React, {useMemo} from 'react';
import PropTypes from 'prop-types';

import generateName from '@pkg/name-generator';
import {styled} from '@pkg/fast-stylesheet/src/react';

import {useI18n} from '@ui/i18n';
import {useInputs} from '@ui/basic-hooks';

import {Margin} from '@ui/basic-components/styled';
import {
  GameDivider,
  GameButton,
  GameInput,
  GameCard,
  GameHeader,
} from '../../components/ui';

import CarPreview from './CarPreview';

const ConfigChooseForm = styled.form(
  {
    width: 200,
  },
);

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
    <ConfigChooseForm
      onSubmit={(e) => {
        e.preventDefault();
        onConfigSet(value);
      }}
    >
      <GameHeader>
        {t('headers.car')}
      </GameHeader>

      <GameCard
        square
        style={{
          width: '100%',
        }}
      >
        <CarPreview />
      </GameCard>

      <GameDivider
        spacing='medium'
        type='dashed'
      />

      <GameHeader>
        {t('headers.nick')}
      </GameHeader>

      <GameInput
        {...l.input('nick')}
        expanded
        required
      />

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
    </ConfigChooseForm>
  );
};

ConfigChoose.displayName = 'ConfigChoose';

ConfigChoose.propTypes = {
  // eslint-disable-next-line react/require-default-props,react/no-unused-prop-types
  client: PropTypes.object,
  onConfigSet: PropTypes.func.isRequired,
};

export default ConfigChoose;
