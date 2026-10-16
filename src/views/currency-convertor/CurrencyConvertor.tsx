import { useEffect, useState } from 'react';

import { currencyApi } from '../../api/currency';
import type { Currency } from '../../types/currency';
import { CurrencySelector } from '../../components/currency-selector/CurrencySelector';
import { useCurrencySelectors } from './hooks/useCurrencySelectors';
import { CurrencyInput } from '../../components/currency-input/CurrencyInput';
import { useConvertInput } from './hooks/useCurrencyInputs';

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
  const { selectorFrom, selectorTo, onChangeFrom, onChangeTo } = useCurrencySelectors();
  const { convertValue, onChangeConvertValue, isConvertValueValid } = useConvertInput();

  // TODO: move to hooks.
  useEffect(() => {
    const fetchCurrencies = async () => {
      setCurrencyState({ status: 'loading', currencies: null, error: null });

      try {
        const currencies = await currencyApi.fetchCurrencies();

        // TODO: Add auto select from/to on fetch.
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
    return (
      <div>
        <p>Fetched {currencyState.currencies.length} currencies.</p>
        <div style={{ display: 'flex', gap: 4 }}>
          <div>
            <CurrencySelector
              currencies={currencyState.currencies}
              value={selectorFrom}
              onChange={onChangeFrom}
            />
            <CurrencyInput value={convertValue} onChange={onChangeConvertValue} />
          </div>
          <div>
            <CurrencySelector
              currencies={currencyState.currencies}
              value={selectorTo}
              onChange={onChangeTo}
            />
            <p>Value valid: {isConvertValueValid().toString()}</p>
            <CurrencyInput value={convertValue} onChange={onChangeConvertValue} readOnly={true} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
