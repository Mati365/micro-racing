import {useState} from 'react';

const usePromiseState = config => useState(
  {
    result: null,
    error: null,
    success: null,
    loading: false,
    ...config,
  },
);

export default usePromiseState;
