import React from 'react';
import PropTypes from 'prop-types';
import pako from 'pako';

import {
  WHITE,
  DARKEST_GRAY,
} from '@ui/colors';

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
import {GameInput} from '../../../../../components/ui';

const ToolbarHolder = styled(
  UnorderedList,
  {
    base: {
      margin: 5,
      float: 'right',

      '& button': {
        color: WHITE,
      },

      '& > li:not(:last-child)': {
        '&::after': {
          position: 'relative',
          top: 2,
          content: '"|"',
          margin: [0, 5],
          color: DARKEST_GRAY,
        },
      },
    },

    disabled: {
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
  {
    omitProps: ['disabled'],
    classSelector: (classes, {disabled}) => disabled && classes.disabled,
    props: {
      row: true,
    },
  },
);

const Toolbar = ({disabled, editor}) => {
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
    <ToolbarHolder disabled={disabled}>
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
        <GameInput
          type='text'
          size='small'
          {...l.input('meta.title', {defaultInputValue: ''})}
        />
      </li>
    </ToolbarHolder>
  );
};

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
  disabled: PropTypes.bool,
  editor: PropTypes.instanceOf(TrackEditor).isRequired,
};

Toolbar.defaultProps = {
  disabled: false,
};

export default Toolbar;
