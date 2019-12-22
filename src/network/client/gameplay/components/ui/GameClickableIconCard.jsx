import React from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';

import {WHITE} from '@ui/colors';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import {flexCenteredStyle} from '@ui/basic-components/styled/Flex';
import textTruncateStyle from '@ui/basic-components/styled/styles/textTruncate';

import {Margin} from '@ui/basic-components/styled';
import GameClickableCard from './GameClickableCard';

const GameClickableIconCard = ({
  icon, iconSize, iconWrapperProps,
  mutedTitle, title,
  classes, className, children,
  ...props
}) => (
  <GameClickableCard
    square={false}
    className={c(
      className,
      classes.base,
    )}
    {...props}
  >
    {icon && (
      <span
        className={c(
          classes.icon,
          iconSize && classes[`icon-size-${iconSize}`],
        )}
        {...iconWrapperProps}
      >
        {icon}
      </span>
    )}

    {children}

    {title && (
      <Margin
        className={c(
          classes.title,
          mutedTitle && classes.mutedTitle,
        )}
        top={2}
        block
      >
        {title}
      </Margin>
    )}
  </GameClickableCard>
);

GameClickableIconCard.displayName = 'GameClickableIconCard';

GameClickableIconCard.propTypes = {
  mutedTitle: PropTypes.bool,
};

GameClickableIconCard.defaultProps = {
  mutedTitle: true,
};

export default injectClassesStylesheet(
  {
    base: {
      extend: flexCenteredStyle,
      userSelect: 'none',
    },

    icon: {
      width: '40%',
      opacity: 0.25,

      '& > img': {
        width: '100%',
      },
    },

    'icon-size-medium-big': {width: '60%'},
    'icon-size-big': {width: '70%'},

    title: {
      extend: textTruncateStyle,

      position: 'absolute',
      left: 0,
      bottom: 8,
      width: '100%',
      textAlign: 'center',
      color: WHITE,
      textTransform: 'uppercase',
      fontSize: '11px',
      fontWeight: 900,
      padding: '0 4px',
    },

    mutedTitle: {
      opacity: 0.5,
    },
  },
)(GameClickableIconCard);
