import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {withInputs} from '@pkg/basic-hooks/src/inputs/useInputs';

export default Component => (
  @withInputs
  class OptimisticEventHandler extends React.Component {
    pendingPromises = {};

    static propTypes = {
      discardResponseWhen: PropTypes.func,
    };

    static defaultProps = {
      discardResponseWhen: R.F,
    };

    onOptimisticEvent = async (
      {
        selector,
        queueUUID,
        promiseFn,
        optimisticValue,
        onDone,
      },
    ) => {
      const {l, value, discardResponseWhen} = this.props;
      const linkCaller = l.setValue;

      // optimistic response
      linkCaller(optimisticValue);
      if (!promiseFn)
        return;

      // real response
      try {
        // prevent race conditions, pick only last response
        const startPromiseTimestampUUID = Date.now();
        const promise = promiseFn().then(
          payload => ({
            payload,
            timestampUUID: startPromiseTimestampUUID,
          }),
        );

        const queuedPromises = this.pendingPromises[queueUUID] || [];
        if (queueUUID) {
          this.pendingPromises[queueUUID] = [
            ...queuedPromises,
            {
              promise,
              timestampUUID: startPromiseTimestampUUID,
            },
          ];
        }

        // after resolve
        const {
          payload,
          timestampUUID: resolvedTimestampUUID,
        } = await promise;

        if (queueUUID) {
          const lastPendingPromise = R.last(this.pendingPromises[queueUUID]);

          this.pendingPromises[queueUUID] = R.reject(
            R.propEq('timestampUUID', resolvedTimestampUUID),
            this.pendingPromises[queueUUID],
          );
          if (resolvedTimestampUUID !== lastPendingPromise.timestampUUID)
            return;

          delete this.pendingPromises[queueUUID];
        }

        // selector is optional, it might not have to update
        // optimistic response because it is equal
        if (selector) {
          const newValue = selector(payload);
          onDone?.(newValue); // eslint-disable-line no-unused-expressions

          const {value: prevValue} = this.props;
          if (!R.equals(optimisticValue, newValue)
              && !discardResponseWhen(prevValue, newValue))
            linkCaller(newValue);
        }
      } catch (e) {
        console.error(e);
        linkCaller(value);
      }
    };

    render() {
      const {l, ...props} = this.props;

      return (
        <Component
          l={{
            ...l,
            onOptimisticEvent: this.onOptimisticEvent,
          }}
          {...props}
        />
      );
    }
  }
);
