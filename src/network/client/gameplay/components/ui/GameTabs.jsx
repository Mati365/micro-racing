import React, {useState} from 'react';
import * as R from 'ramda';

import {
  DARKEST_GRAY,
  WHITE,
  BLACK,
} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {
  Flex,
  UnorderedList,
} from '@ui/basic-components/styled';

const TabContent = styled.div(
  {
    base: {
      flex: 1,
      border: `1px solid ${DARKEST_GRAY}`,
    },

    'padding-none': {padding: 0},
    'padding-small': {padding: 5},
    'padding-medium': {padding: 10},
  },
  {
    omitProps: ['padding'],
    classSelector: (classes, {padding}) => classes[`padding-${padding}`],
  },
);

const GameTabs = ({initialTab, children, style, className}) => {
  const childrenArray = React.Children.toArray(children);
  const [activeTabId, setActiveTab] = useState(
    R.defaultTo(childrenArray[0].props.id, initialTab),
  );

  const tabElement = R.find(
    ({props}) => props.id === activeTabId,
    childrenArray,
  );

  return (
    <Flex
      direction='column'
      style={style}
      className={className}
    >
      <UnorderedList row>
        {React.Children.map(
          children,
          (child) => {
            const {id: tabId} = child.props;

            return React.cloneElement(
              child,
              {
                key: tabId,
                active: tabId === activeTabId,
                onClick: () => setActiveTab(tabId),
              },
              null,
            );
          },
        )}
      </UnorderedList>

      <TabContent padding={tabElement?.props?.padding || 'medium'}>
        {tabElement?.props.children(
          {
            activeTabId,
            setActiveTab,
          },
        )}
      </TabContent>
    </Flex>
  );
};

GameTabs.displayName = 'GameTabs';

const TabWrapper = styled.li(
  {
    base: {
      position: 'relative',
      top: 1,
      left: 0,
      padding: [7, 10],
      border: `1px solid ${DARKEST_GRAY}`,
      borderBottomColor: 'transparent',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      color: WHITE,
      opacity: 0.25,
      cursor: 'pointer',
      transition: 'opacity 100ms ease-in-out',

      '&:not(:last-child)': {
        marginRight: 5,
      },
    },

    active: {
      opacity: 1,
      borderBottomColor: `${BLACK} !important`,
    },
  },
  {
    omitProps: ['active'],
    classSelector: (classes, {active}) => active && classes.active,
  },
);

GameTabs.Tab = ({title, active, onClick}) => (
  <TabWrapper
    active={active}
    onClick={onClick}
  >
    {title}
  </TabWrapper>
);

export default GameTabs;
