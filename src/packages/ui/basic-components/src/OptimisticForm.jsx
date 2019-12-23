import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import withOptimisticEventHandler from './decorators/withOptimisticEventHandler';
import LinkedInputsObject from './LinkedInputsObject';

export default
@withOptimisticEventHandler
class OptimisiticForm extends React.Component {
  static propTypes = {
    saveDelay: PropTypes.number,
    optimisticValueParserFn: PropTypes.func,
    asyncSubmitFn: PropTypes.func.isRequired,
  };

  static defaultProps = {
    saveDelay: 300,
    optimisticValueParserFn: R.identity,
  };

  onChange = (value, prevValue) => {
    const {
      l,
      selectorFn,
      asyncSubmitFn,
      optimisticValueParserFn,
    } = this.props;

    if (R.equals(value, prevValue))
      return false;

    l.onOptimisticEvent(
      {
        queueUUID: 'silent-form-submit',
        promiseFn: () => asyncSubmitFn(value),
        optimisticValue: optimisticValueParserFn(value),
        selector: selectorFn,
      },
    );
    return true;
  };

  render() {
    const {children, saveDelay, ...props} = this.props;

    return (
      <LinkedInputsObject
        {...props}
        onChange={this.onChange}
      >
        {linkParams => children(
          {
            ...linkParams,
            optimisticValueLink: props.l,
            onOptimisticEvent: this.onChange,
          },
        )}
      </LinkedInputsObject>
    );
  }
}
