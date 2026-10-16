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

const DEFAULT_FROM = 'USD';
const DEFAULT_TO = 'PLN';

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

        setCurrencyState({
          status: 'success',
          value: currencies,
          error: null,
        });
        onChangeFrom(DEFAULT_FROM || (currencies.length > 0 ? currencies[0].code : ''));
        onChangeTo(DEFAULT_TO || (currencies.length > 0 ? currencies[0].code : ''));
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
