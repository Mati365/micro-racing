import React from 'react';
import PropTypes from 'prop-types';

import {WHITE} from '@ui/colors';

import {useI18n} from '@ui/i18n';
import {styled} from '@pkg/fast-stylesheet/src/react';

import {flexCenteredStyle} from '@ui/basic-components/styled/Flex';

const KeymapTableHolder = styled.table(
  {
    tableLayout: 'fixed',
    textTransform: 'uppercase',

    '& caption': {
      marginBottom: 15,
      fontWeight: 700,
      fontSize: '11px',
    },

    '& tbody': {
      fontWeight: 'initial',
    },

    '& td': {
      width: 56,
      verticalAlign: 'top',
      textAlign: 'center',
    },

    '& *': {
      boxSizing: 'content-box',
    },
  },
);

const Key = styled.span(
  {
    extend: flexCenteredStyle,

    display: 'inline-flex',
    width: 22,
    height: 22,
    margin: [0, 'auto'],
    padding: 4,
    borderRadius: 4,
    border: `1px solid ${WHITE}`,
    borderBottomWidth: 4,
  },
);

const KeyCaption = styled.div(
  {
    margin: [7, 0, 10],
    fontSize: '10px',
    lineHeight: '13px',
  },
);

const Keymap = ({style, className, keys}) => {
  const t = useI18n('game.keyboard');

  return (
    <KeymapTableHolder
      style={style}
      className={className}
    >
      <caption>
        {`${t('game.keyboard.controls')}:`}
      </caption>

      <tbody>
        <tr>
          <td
            colSpan={3}
            style={{
              textAlign: 'center',
            }}
          >
            <Key>{keys.throttle}</Key>
            <KeyCaption>
              {t('throttle')}
            </KeyCaption>
          </td>
        </tr>

        <tr>
          <td>
            <Key>{keys.turnLeft}</Key>
            <KeyCaption>
              {t('turnLeft')}
            </KeyCaption>
          </td>

          <td>
            <Key>{keys.brake}</Key>
            <KeyCaption>
              {t('brake')}
            </KeyCaption>
          </td>

          <td>
            <Key>{keys.turnRight}</Key>
            <KeyCaption>
              {t('turnRight')}
            </KeyCaption>
          </td>
        </tr>
      </tbody>
    </KeymapTableHolder>
  );
};

Keymap.displayName = 'Keymap';

Keymap.propTypes = {
  keys: PropTypes.shape(
    {
      turnLeft: PropTypes.node,
      turnRight: PropTypes.node,
      brake: PropTypes.node,
      throttle: PropTypes.node,
    },
  ),
};

Keymap.defaultProps = {
  keys: {
    throttle: 'w',
    brake: 's',
    turnLeft: 'a',
    turnRight: 'd',
  },
};

export default React.memo(Keymap);
