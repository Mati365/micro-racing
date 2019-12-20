import React, {useMemo} from 'react';
import PropTypes from 'prop-types';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import generateName from '@pkg/name-generator';
import {styled} from '@pkg/fast-stylesheet/src/react';
import {
  asyncTimeout,
  getRandomObjValue,
} from '@pkg/basic-helpers';

import {useI18n} from '@ui/i18n';

import {Margin} from '@ui/basic-components/styled';
import {
  AsyncOperationForm,
  AutofocusInput,
} from '@ui/basic-components';

import CarsChooseRow from './CarsChooseRow';
import {ServerErrorsList} from '../../components/parts';
import {
  GameDivider,
  GameButton,
  GameInput,
  GameHeader,
} from '../../components/ui';

const ConfigChooseForm = styled(
  AsyncOperationForm,
  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
);

const ConfigChoose = ({onConfigSet}) => {
  const t = useI18n('game.screens.choose_config');
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
      initialData={{
        carType: getRandomObjValue(CAR_TYPES),
        nick: useMemo(generateName, []),
      }}
      onSubmit={
        async (...args) => {
          await asyncTimeout(500);
          return onConfigSet(...args);
        }
      }
    >
      {({l, promiseState: {loading, errors}}) => (
        <>
          <GameHeader>
            {t('headers.car')}
          </GameHeader>

          <CarsChooseRow
            carsInfo={carsInfo}
            {...l.input('carType')}
          />

          <div style={{width: 200}}>
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
                disabled={loading}
                expanded
              >
                {t(loading ? 'sending' : 'play')}
              </GameButton>
            </Margin>

            {errors && (
              <Margin top={2}>
                <ServerErrorsList errors={errors} />
              </Margin>
            )}
          </div>
        </>
      )}
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
