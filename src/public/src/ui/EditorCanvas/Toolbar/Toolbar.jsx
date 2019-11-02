import React from 'react';
import PropTypes from 'prop-types';
import pako from 'pako';

import {WHITE} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';

import {useI18n} from '@ui/i18n';
import {useInputs} from '@ui/basic-hooks';

import {
  exportBlobToFile,
  importBlobFromFile,
  parameterize,
} from '@pkg/basic-helpers';

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
  const {l, value, setValue} = useInputs(
    {
      initialData: {
        meta: {
          title: 'Game map',
        },
      },
    },
  );

  const onSave = () => {
    exportBlobToFile(
      `${parameterize(value.meta.title || 'blank')}.gzip`,
      new Blob([
        pako.deflate(
          editor.toBSON(value.meta),
        ),
      ]),
    );
  };

  const onLoad = async () => {
    const result = pako.inflate(
      await importBlobFromFile(),
    );

    const {meta} = editor.fromBSON(result);
    setValue(
      {
        ...value,
        meta: meta || {},
      },
    );
  };

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

      <li>
        <input
          type='text'
          {...l.input('meta.title', {defaultInputValue: ''})}
        />
      </li>
    </ToolbarHolder>
  );
};

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
  editor: PropTypes.instanceOf(TrackEditor).isRequired,
};

export default Toolbar;
