import { useEffect, useState } from 'react';
import { AxiosError, isCancel } from 'axios';

import { currencyApi } from '../../../api/currency';
import type { GenericAsyncState } from '../../../types/state';

type ConvertState = GenericAsyncState<number>;

export const CONVERT_INPUT_DEBOUNCE_MS = 500;

export type UseConvertStateParams = {
  from: string;
  to: string;
  amount: string | number;
};

export function useConvertState({ from, to, amount }: UseConvertStateParams): {
  convertState: ConvertState;
} {
  const [convertState, setConvertState] = useState<ConvertState>({
    status: 'idle',
    value: null,
    error: null,
  });
  const [resultKey, setResultKey] = useState('');

  const isAmountValid = typeof amount === 'number' && amount > 0;
  const currentKey = `${from}-${to}-${amount}`;

  useEffect(() => {
    if (!isAmountValid || !from || !to || from === to) return;

    const abortController = new AbortController();
    const { signal } = abortController;

    const convertValues = async () => {
      try {
        const { value } = await currencyApi.convertCurrencies(from, to, amount, signal);

        setConvertState({ status: 'success', value, error: null });
        setResultKey(currentKey);
      } catch (e) {
        if (isCancel(e)) return;

        const code = e instanceof AxiosError ? e.response?.status : null;

        setConvertState({
          status: 'error',
          value: null,
          error: `Error while converting currencies. Try again later.${code ? ` Error code: ${code}.` : ''}`,
        });
        setResultKey(currentKey);
      }
    };

    const convertTimer = setTimeout(() => convertValues(), CONVERT_INPUT_DEBOUNCE_MS);

    return () => {
      clearTimeout(convertTimer);
      abortController.abort();
    };
  }, [from, to, amount, isAmountValid, currentKey]);

  if (!isAmountValid || !from || !to) {
    return { convertState: { status: 'idle', value: null, error: null } };
  }
  if (from === to) {
    return { convertState: { status: 'success', value: amount, error: null } };
  }
  if (resultKey !== currentKey) {
    return { convertState: { status: 'loading', value: null, error: null } };
  }

  return { convertState };
}
