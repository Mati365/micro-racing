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
    keys = [],
    rethrow = false,
    afterExecFn = R.F,
    initialPromiseState,
    errorSelectorFn = R.identity,
  } = {},
) => {
  const [promiseState, setPromiseState] = usePromiseState(initialPromiseState);
  const unmounted = useRef(false);
  const executorRef = useRef();

  useEffect(
    () => () => {
      unmounted.current = true;
    },
    [],
  );

  executorRef.current = promiseFn;

  const fn = useCallback(
    async (...args) => {
      try {
        if (!promiseState.loading && !silent) {
          setPromiseState(
            {
              loading: true,
            },
          );
        }

        const result = await executorRef.current(...args);
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
            errors: errorSelectorFn(e) || true,
          },
        );

        if (rethrow)
          throw errorSelectorFn(e);
        else
          console.error(e);
      }

      return null;
    },
    keys,
  );

  return [
    fn,
    promiseState,
  ];
};

export default usePromiseCallback;
