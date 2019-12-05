import React from 'react';
// import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
// import {useI18n} from '@ui/i18n';

// import TrackSegments from '@game/logic/track/TrackSegments/TrackSegments';
// import {MapThumbnail} from './parts';

const RaceRoomInfoToolbarHolder = styled.div(
  {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  {
    index: 1,
  },
);

const RaceRoomInfoToolbar = () => (
  <RaceRoomInfoToolbarHolder>
    Test
  </RaceRoomInfoToolbarHolder>
);

export default RaceRoomInfoToolbar;
