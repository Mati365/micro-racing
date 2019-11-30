import {COLORS} from '@pkg/isometric-renderer/FGL';
import {styled} from '@pkg/fast-stylesheet/src/react';

const RaceRoomInfoToolbar = styled.div(
  {
    base: {
      width: '100%',
      height: 32,
      background: COLORS.WHITE,
    },
  },
  {
    index: 1,
  },
);

export default RaceRoomInfoToolbar;
