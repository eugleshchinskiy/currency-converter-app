import { useEffect, useState } from 'react';
import { AxiosError, isCancel } from 'axios';

import type { GenericAsyncState } from '../../../types/state';
import type { Currency } from '../../../types/currency';
import { currencyApi } from '../../../api/currency';

type CurrencyState = GenericAsyncState<Map<string, Currency>>;

export function useCurrencyState() {
  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    status: 'loading',
    value: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchCurrencies = async () => {
      setCurrencyState({ status: 'loading', value: null, error: null });
      try {
        const currencies = await currencyApi.fetchCurrencies(signal);

        if (currencies.size > 0) {
          setCurrencyState({
            status: 'success',
            value: currencies,
            error: null,
          });
        } else {
          setCurrencyState({
            status: 'error',
            value: null,
            error: 'Error: no currencies were found. Try again later.',
          });
        }
      } catch (e) {
        if (isCancel(e)) return;

        const code = e instanceof AxiosError ? e.response?.status : null;

        setCurrencyState({
          status: 'error',
          value: null,
          error: `Error while fetching currencies. Try again later.${code ? ` Error code: ${code}.` : ''}`,
        });
      }
    };

    fetchCurrencies();

    return () => controller.abort();
  }, []);

  return { currencyState };
}
