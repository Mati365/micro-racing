import {ssr} from '@pkg/basic-helpers';
import usePromise from '@ui/basic-hooks/async/usePromise';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';

const useClientSocket = (
  {
    uri = `ws://${ssr ? 'lvh.me' : document.domain}:8080`,
  } = {},
) => {
  const {loading, result} = usePromise(
    () => PlayerClientSocket.connect(uri),
    [uri],
  );

  return {
    connecting: loading,
    client: result,
  };
};

export default useClientSocket;
