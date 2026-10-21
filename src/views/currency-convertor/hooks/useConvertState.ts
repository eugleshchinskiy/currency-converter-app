import { useEffect, useState } from 'react';
import { AxiosError, isCancel } from 'axios';

import { currencyApi } from '../../../api/currency';
import type { GenericAsyncState } from '../../../types/state';

type ConvertState = GenericAsyncState<number>;

export const CONVERT_INPUT_DEBOUNCE_MS = 500;

export type UseConvertStateParams = {
  from: string;
  to: string;
  amount?: string | number;
};

export function useConvertState({ from, to, amount }: UseConvertStateParams) {
  const [convertState, setConvertState] = useState<ConvertState>({
    status: 'idle',
    value: null,
    error: null,
  });

  useEffect(() => {
    const isAmountValid = typeof amount === 'number' && amount > 0;

    const abortController = new AbortController();
    const { signal } = abortController;

    const convertValues = async () => {
      if (!from || !to) return;

      if (!isAmountValid) {
        setConvertState({ status: 'idle', value: null, error: null });
        return;
      }

      if (from === to) {
        setConvertState({
          status: 'success',
          value: amount,
          error: null,
        });
        return;
      }

      setConvertState({ status: 'loading', value: null, error: null });

      try {
        const { value } = await currencyApi.convertCurrencies(from, to, amount, signal);

        setConvertState({
          status: 'success',
          value,
          error: null,
        });
      } catch (e) {
        if (isCancel(e)) return;

        const code = e instanceof AxiosError ? e.response?.status : null;

        setConvertState({
          status: 'error',
          value: null,
          error: `Error while converting currencies. Try again later.${code ? ` Error code: ${code}.` : ''}`,
        });
      }
    };

    const convertTimer = setTimeout(() => convertValues(), CONVERT_INPUT_DEBOUNCE_MS);

    return () => {
      clearTimeout(convertTimer);
      abortController.abort();
    };
  }, [from, to, amount]);

  return {
    convertState,
  };
}
