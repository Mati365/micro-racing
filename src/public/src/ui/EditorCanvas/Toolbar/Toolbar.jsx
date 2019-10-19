import React from 'react';
import PropTypes from 'prop-types';

import {WHITE} from '@ui/colors';

import {useI18n} from '@ui/i18n';
import {styled} from '@pkg/fast-stylesheet/src/react';
import {
  TextButton,
  UnorderedList,
} from '@ui/basic-components/styled';

import TrackEditor from '../TrackEditor';

const ToolbarHolder = styled(
  UnorderedList,
  {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 5,

    '& button': {
      color: WHITE,
    },

    '& > li:not(:last-child)': {
      '&::after': {
        content: '"|"',
        margin: [0, 5],
        color: WHITE,
      },
    },
  },
  {
    props: {
      row: true,
    },
  },
);

const Toolbar = ({editor}) => {
  const t = useI18n();

  const onSave = () => {
    console.log(editor);
  };
  const onLoad = () => {};

  return (
    <ToolbarHolder>
      <li>
        <TextButton onClick={onSave}>
          {t('editor.titles.save')}
        </TextButton>
      </li>

      <li>
        <TextButton onClick={onLoad}>
          {t('editor.titles.load')}
        </TextButton>
      </li>
    </ToolbarHolder>
  );
};

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
  editor: PropTypes.instanceOf(TrackEditor).isRequired,
};

export default Toolbar;
