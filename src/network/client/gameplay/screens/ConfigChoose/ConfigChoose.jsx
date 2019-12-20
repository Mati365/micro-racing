import React, {useMemo} from 'react';
import PropTypes from 'prop-types';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import generateName from '@pkg/name-generator';
import {styled} from '@pkg/fast-stylesheet/src/react';
import {getRandomObjValue} from '@pkg/basic-helpers';

import {useI18n} from '@ui/i18n';
import {useInputs} from '@ui/basic-hooks';

import {Margin} from '@ui/basic-components/styled';
import {AutofocusInput} from '@ui/basic-components';

import CarsChooseRow from './CarsChooseRow';
import {
  GameDivider,
  GameButton,
  GameInput,
  GameHeader,
} from '../../components/ui';

const ConfigChooseForm = styled.form(
  {
    textAlign: 'center',
    width: 200,
  },
);

const ConfigChoose = ({onConfigSet}) => {
  const t = useI18n('game.screens.choose_config');
  const {l, value} = useInputs(
    {
      initialData: {
        carType: getRandomObjValue(CAR_TYPES),
        nick: useMemo(generateName, []),
      },
    },
  );

  const carsInfo = [
    {
      type: CAR_TYPES.BLUE,
    },
    {
      type: CAR_TYPES.RED,
    },
  ];

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

      <CarsChooseRow
        carsInfo={carsInfo}
        style={{
          transform: 'translateX(-50%)',
        }}
        {...l.input('carType')}
      />

      <GameDivider
        spacing='medium'
        type='dashed'
      />

      <GameHeader>
        {t('headers.nick')}
      </GameHeader>

      <AutofocusInput>
        <GameInput
          {...l.input('nick')}
          style={{
            textAlign: 'center',
          }}
          expanded
          required
        />
      </AutofocusInput>

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

export default React.memo(ConfigChoose);
