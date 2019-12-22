import React from 'react';

import {
  GameCardsList,
  GameClickableCard,
} from '../../components/ui';

import CarPreview from './CarPreview';

const CarsChooseRow = ({carsInfo, value, onChange, ...props}) => (
  <GameCardsList {...props}>
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
  </GameCardsList>
);

CarsChooseRow.displayName = 'CarsChooseRow';

export default CarsChooseRow;
