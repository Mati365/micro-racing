import React, {useEffect, useState} from 'react';

import {WHITE} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {OverlayTitle} from '../parts/TitledOverlay';

const StatsWrapper = styled(
  OverlayTitle,
  {
    position: 'absolute',
    right: 5,
    bottom: 10,
    color: WHITE,
    fontSize: '11px',
    textAlign: 'center',
  },
);

const NetworkStats = ({client}) => {
  const [ping, setPing] = useState(null);

  useEffect(
    () => {
      const subscriber = client.observers.ping.subscribe(
        (delay) => {
          if (delay > 60)
            console.warn(`High ping ${delay} ms!`);

          setPing(delay);
        },
        true,
      );

      return ::subscriber.unsubscribe;
    },
    [],
  );

  return (
    <StatsWrapper>
      {`Ping: ${ping === null ? '-' : ping} ms`}
    </StatsWrapper>
  );
};

NetworkStats.displayName = 'NetworkStats';

export default NetworkStats;
