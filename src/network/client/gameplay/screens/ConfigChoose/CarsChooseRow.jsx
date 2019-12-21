import React from 'react';

import {styled} from '@pkg/fast-stylesheet/src/react';

import {UnorderedList} from '@ui/basic-components/styled';
import {GameClickableCard} from '../../components/ui';
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

const CarsChooseRow = ({carsInfo, value, onChange, ...props}) => (
  <List {...props}>
    {carsInfo.map(
      ({type}) => (
        <li key={type}>
          <GameClickableCard
            active={value === type}
            onClick={() => onChange(type)}
          >
            <CarPreview carType={type} />
          </GameClickableCard>
        </li>
      ),
    )}
  </List>
);

CarsChooseRow.displayName = 'CarsChooseRow';

export default CarsChooseRow;
