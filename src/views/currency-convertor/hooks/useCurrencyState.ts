import { useEffect, useState } from 'react';

import type { GenericAsyncState } from '../../../types/state';
import type { Currency } from '../../../types/currency';
import { currencyApi } from '../../../api/currency';
import { AxiosError } from 'axios';
import type { useCurrencySelectors } from './useCurrencySelectors';

type CurrencyState = GenericAsyncState<Currency[]>;

type UseConvertStateParams = Pick<
  ReturnType<typeof useCurrencySelectors>,
  'onChangeFrom' | 'onChangeTo'
>;

export const DEFAULT_FROM = 'USD';
export const DEFAULT_TO = 'PLN';

export function useCurrencyState({ onChangeFrom, onChangeTo }: UseConvertStateParams) {
  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    status: 'idle',
    value: null,
    error: null,
  });

  useEffect(() => {
    const fetchCurrencies = async () => {
      setCurrencyState({ status: 'loading', value: null, error: null });

      try {
        const currencies = await currencyApi.fetchCurrencies();

        if (currencies.length > 0) {
          setCurrencyState({
            status: 'success',
            value: currencies,
            error: null,
          });
          const hasDefaultFrom = currencies.some(({ short_code }) => short_code === DEFAULT_FROM);
          const hasDefaultTo = currencies.some(({ short_code }) => short_code === DEFAULT_TO);

          onChangeFrom(hasDefaultFrom ? DEFAULT_FROM : currencies[0].short_code);
          onChangeTo(hasDefaultTo ? DEFAULT_TO : currencies[0].short_code);
        } else {
          setCurrencyState({
            status: 'error',
            value: null,
            error: 'Error: no currencies were found. Try again later.',
          });
        }
      } catch (e) {
        const code = e instanceof AxiosError ? e.response?.status : null;

        setCurrencyState({
          status: 'error',
          value: null,
          error: `Error while fetching currencies. Try again later.${code ? ` Error code: ${code}.` : ''}`,
        });
      }
    };

    fetchCurrencies();
  }, [onChangeFrom, onChangeTo]);

  return { currencyState };
}
