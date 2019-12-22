import React from 'react';
import PropTypes from 'prop-types';

import {CAR_TYPES} from '@game/network/constants/serverCodes';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {useI18n} from '@ui/i18n';

import {Margin} from '@ui/basic-components/styled';
import {
  AsyncOperationForm,
  AutofocusInput,
} from '@ui/basic-components';

import CarsChooseRow from './CarsChooseRow';
import {ScreenHolder} from '../TitledScreen';
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

const ConfigChoose = ({initialData, created, onConfigSet}) => {
  const t = useI18n('game.screens.choose_config');
  const carsInfo = [
    {
      type: CAR_TYPES.BLUE,
    },
    {
      type: CAR_TYPES.RED,
    },
  ];

  const renderForm = ({l, modified, promiseState: {loading, errors}}) => (
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
            disabled={
              loading || (created && !modified)
            }
            expanded
          >
            {t((() => {
              if (loading) return 'sending';
              if (created) return 'update';
              return 'play';
            })())}
          </GameButton>
        </Margin>

        {errors && (
          <Margin top={2}>
            <ServerErrorsList errors={errors} />
          </Margin>
        )}
      </div>
    </>
  );

  return (
    <ScreenHolder expanded={false}>
      <ConfigChooseForm
        initialData={initialData}
        onSubmit={onConfigSet}
      >
        {renderForm}
      </ConfigChooseForm>
    </ScreenHolder>
  );
};

ConfigChoose.displayName = 'ConfigChoose';

ConfigChoose.propTypes = {
  created: PropTypes.bool,
  onConfigSet: PropTypes.func.isRequired,
};

ConfigChoose.defaultProps = {
  created: false,
};

export default React.memo(ConfigChoose);
