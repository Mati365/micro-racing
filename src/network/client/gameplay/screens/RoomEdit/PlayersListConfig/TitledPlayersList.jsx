import React from 'react';
import PropTypes from 'prop-types';

import {UnorderedList} from '@ui/basic-components/styled';
import {GameLabel} from '../../../components/ui';
import KickablePlayerListItem from './KickablePlayerListItem';

const TitledPlayersList = ({
  title, list, spaced, gameBoard,
  listItem: ListItem = KickablePlayerListItem,
  listItemProps,
}) => {
  if (!list || !list.length)
    return null;

  return (
    <>
      {title && (
        <GameLabel
          spaceTop={spaced ? 2 : 0}
          spaceBottom={0}
        >
          {title}
        </GameLabel>
      )}

      <UnorderedList
        style={{
          maxHeight: 90,
          overflowY: 'auto',
        }}
      >
        {list.map(
          (player) => {
            const {ownerID} = gameBoard.roomInfo;

            return (
              <ListItem
                key={player.id}
                op={ownerID}
                currentOp={
                  gameBoard.isClientOP()
                }
                current={
                  gameBoard.client.info.id === player.id
                }
                player={player}
                {...listItemProps}
              />
            );
          },
        )}
      </UnorderedList>
    </>
  );
};

TitledPlayersList.displayName = 'TitledPlayersList';

TitledPlayersList.propTypes = {
  title: PropTypes.node,
  list: PropTypes.arrayOf(PropTypes.any).isRequired,
  gameBoard: PropTypes.any.isRequired,
  spaced: PropTypes.bool,
  listItemProps: PropTypes.any,
};

TitledPlayersList.defaultProps = {
  title: null,
  spaced: false,
  listItemProps: null,
};

export default TitledPlayersList;
