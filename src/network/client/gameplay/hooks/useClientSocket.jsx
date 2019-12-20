import {useRef} from 'react';
import * as R from 'ramda';

import {safeArray, ssr} from '@pkg/basic-helpers';
import usePromiseCallback from '@ui/basic-hooks/async/usePromiseCallback';

import PlayerClientSocket from '../../protocol/PlayerClientSocket';

const useClientSocket = (
  {
    uri = `ws://${ssr ? 'lvh.me' : document.domain}:8080`,
  } = {},
) => {
  const socket = useRef(null);
  const [connect, {result, loading}] = usePromiseCallback(
    (config) => {
      if (socket.current)
        socket.current.close();

      return (
        PlayerClientSocket
          .connect(uri, config)
          .then((data) => {
            socket.current = data.ws;
            return data;
          })
      );
    },
    {
      rethrow: true,
      errorSelectorFn: R.compose(
        safeArray,
        R.propOr(true, 'error'),
      ),
    },
  );

  return {
    client: result,
    connecting: loading,
    connect,
  };
};

export default useClientSocket;
