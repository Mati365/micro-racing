import React from 'react';

import {
  CRIMSON_RED,
  CRIMSON_RED_DARKEN_5,
  GRAY_DARKEN_3,
} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';

import {UnorderedList} from '@ui/basic-components/styled';
import {GameCard} from '../../components/ui';
import CarPreview from './CarPreview';

const List = styled(
  UnorderedList,
  {
    '& li': {
      '&:not(:last-child)': {
        marginRight: 10,
      },
    },
  },
  {
    props: {
      row: true,
    },
  },
);

const ClickableCarCard = styled(
  GameCard,
  {
    base: {
      cursor: 'pointer',
      flexShrink: 0,
      width: 200,
      paddingBottom: 200,
      transition: 'border-color 100ms ease-in-out',
      boxShadow: '0 0.2rem transparent',

      '&:hover': {
        borderColor: GRAY_DARKEN_3,
      },
    },

    active: {
      borderColor: `${CRIMSON_RED} !important`,
      boxShadow: `0 0.2rem ${CRIMSON_RED_DARKEN_5}`,
      borderWidth: 2,
      borderStyle: 'solid',
    },
  },
  {
    index: 4,
    props: {
      square: true,
    },
    omitProps: ['active'],
    classSelector: (classes, {active}) => active && classes.active,
  },
);

const CarsChooseRow = ({carsInfo, value, onChange, ...props}) => (
  <List {...props}>
    {carsInfo.map(
      ({type}) => (
        <li key={type}>
          <ClickableCarCard
            active={value === type}
            onClick={() => onChange(type)}
          >
            <CarPreview carType={type} />
          </ClickableCarCard>
        </li>
      ),
    )}
  </List>
);

CarsChooseRow.displayName = 'CarsChooseRow';

export default CarsChooseRow;
