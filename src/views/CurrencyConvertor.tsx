import { useEffect, useState } from 'react';

import { currencyApi } from '../api/currency';
import type { Currency } from '../types/currency';

type CurrencyState =
  | { status: 'idle'; currencies: null; error: null }
  | { status: 'loading'; currencies: null; error: null }
  | { status: 'success'; currencies: Currency[]; error: null }
  | { status: 'error'; currencies: null; error: string };

export function CurrencyConvertor() {
  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    status: 'idle',
    currencies: null,
    error: null,
  });

  useEffect(() => {
    const fetchCurrencies = async () => {
      setCurrencyState({ status: 'loading', currencies: null, error: null });

      try {
        const currencies = await currencyApi.fetchCurrencies();

        setCurrencyState({
          status: 'success',
          currencies,
          error: null,
        });
      } catch {
        setCurrencyState({
          status: 'error',
          currencies: null,
          // TODO: consider adding per error handling or add notes about it.
          error: 'Error while fetching currencies.',
        });
      }
    };

    fetchCurrencies();
  }, []);

  // TODO: Add proper visual handling for all statues.
  if (currencyState.status === 'loading') {
    return <p>Loading...</p>;
  }

  if (currencyState.status === 'error') {
    return <p>Error: {currencyState.error}</p>;
  }

  if (currencyState.status === 'success') {
    return <p>Fetched {currencyState.currencies.length} currencies.</p>;
  }

  return null;
}
