import * as R from 'ramda';
import {
  useRef,
  useEffect,
  useCallback,
} from 'react';

import safeArray from '@pkg/basic-helpers/list/safeArray';
import usePromiseState from './usePromiseState';

/**
 * @param {Function} promiseFn
 *
 * @returns Callback with executes promiseFn and sets loading / error flags
 */
const usePromiseCallback = (
  promiseFn,
  {
    silent = false,
    cacheKeys = [],
    rethrow = false,
    afterExecFn = R.F,
    initialPromiseState,
    errorSelectorFn,
  },
) => {
  const [promiseState, setPromiseState] = usePromiseState(initialPromiseState);
  const unmounted = useRef(false);

  useEffect(
    () => () => {
      unmounted.current = true;
    },
    [],
  );

  const fn = useCallback(
    async (...args) => {
      try {
        if (!promiseState.loading && !silent) {
          setPromiseState(
            {
              errors: false,
              loading: true,
            },
          );
        }

        const result = await promiseFn(...args);
        const resultErrors = result?.error || result?.errors || null;

        if (!unmounted.current && !silent) {
          setPromiseState(
            {
              result,
              loading: false,
              ...(
                resultErrors
                  ? {errors: resultErrors, success: false}
                  : {errors: false, success: false}
              ),
            },
          );
        }

        afterExecFn(
          {
            hasErrors: !!resultErrors,
            errors: resultErrors && safeArray(resultErrors),
            result,
          },
        );
        return result;
      } catch (e) {
        afterExecFn(
          {
            hasErrors: true,
            result: null,
            errors: safeArray(e),
          },
        );
        !unmounted.current && !silent && setPromiseState(
          {
            result: null,
            errors: errorSelectorFn?.(e) || true,
          },
        );

        if (rethrow)
          throw e;
      }

      return null;
    },
    cacheKeys,
  );

  return [
    fn,
    promiseState,
  ];
};

export default usePromiseCallback;
