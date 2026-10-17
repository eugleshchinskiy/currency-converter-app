import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import { currencyApi } from '../../../api/currency';
import axios from '../../../lib/axios';
import type { GenericAsyncState } from '../../../types/state';
import type { useConvertInput } from './useCurrencyInputs';
import type { useCurrencySelectors } from './useCurrencySelectors';

type ConvertState = GenericAsyncState<number>;

const CONVERT_INPUT_DEBOUNCE_MS = 500;

export type UseConvertStateParams = Pick<
  ReturnType<typeof useConvertInput>,
  'convertValue' | 'isConvertValueValid' | 'convertValueNumber'
> &
  Pick<ReturnType<typeof useCurrencySelectors>, 'selectorFrom' | 'selectorTo'>;

export function useConvertState({
  convertValue,
  isConvertValueValid,
  convertValueNumber,
  selectorFrom,
  selectorTo,
}: UseConvertStateParams) {
  const [convertState, setConvertState] = useState<ConvertState>({
    status: 'idle',
    value: null,
    error: null,
  });

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const convertValues = async () => {
      if (convertValue === '') {
        setConvertState({ status: 'idle', value: null, error: null });
        return;
      }
      if (!isConvertValueValid || !selectorFrom || !selectorTo) return;

      if (selectorFrom === selectorTo) {
        setConvertState({
          status: 'success',
          value: convertValueNumber as number,
          error: null,
        });
        return;
      }

      setConvertState({ status: 'loading', value: null, error: null });

      try {
        const { value } = await currencyApi.convertCurrencies(
          selectorFrom,
          selectorTo,
          convertValueNumber as number,
          signal,
        );

        setConvertState({
          status: 'success',
          value,
          error: null,
        });
      } catch (e) {
        if (axios.isCancel(e)) return;

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
  }, [isConvertValueValid, convertValueNumber, selectorFrom, selectorTo, convertValue]);

  return {
    convertState,
  };
}
