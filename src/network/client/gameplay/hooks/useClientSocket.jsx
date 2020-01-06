import {useRef} from 'react';
import * as R from 'ramda';

import {
  SERVER_PORT,
  SERVER_PROD,
} from '@game/network/constants/runtimeConfig';

import {safeArray, ssr} from '@pkg/basic-helpers';
import usePromiseCallback from '@ui/basic-hooks/async/usePromiseCallback';

import PlayerClientSocket from '../../protocol/PlayerClientSocket';

const useClientSocket = (
  {
    uri = `${SERVER_PROD ? 'wss' : 'ws'}://${ssr ? 'lvh.me' : document.domain}${SERVER_PROD ? '' : `:${SERVER_PORT}`}`,
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
