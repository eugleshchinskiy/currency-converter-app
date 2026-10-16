import { useEffect, useState } from 'react';

import { currencyApi } from '../../api/currency';
import type { Currency } from '../../types/currency';
import { CurrencySelector } from '../../components/currency-selector/CurrencySelector';
import { useCurrencySelectors } from './hooks/useCurrencySelectors';
import { CurrencyInput } from '../../components/currency-input/CurrencyInput';
import { useConvertInput } from './hooks/useCurrencyInputs';
import type { GenericAsyncState } from '../../types/state';
import axios from '../../lib/axios';
import { Loader } from '@mantine/core';

type CurrencyState = GenericAsyncState<Currency[]>;
type ConvertState = GenericAsyncState<number>;

const DEFAULT_FROM = 'USD';
const DEFAULT_TO = 'PLN';
const CONVERT_INPUT_DEBOUNCE_MS = 500;

export function CurrencyConvertor() {
  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    status: 'idle',
    value: null,
    error: null,
  });
  const [convertState, setConvertState] = useState<ConvertState>({
    status: 'idle',
    value: null,
    error: null,
  });
  const { selectorFrom, selectorTo, onChangeFrom, onChangeTo } = useCurrencySelectors();
  const { convertValue, onChangeConvertValue, isConvertValueValid, getConvertValueNumber } =
    useConvertInput();

  // TODO: move to hooks.
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
      } catch {
        setCurrencyState({
          status: 'error',
          value: null,
          // TODO: consider adding per error handling or add notes about it.
          error: 'Error while fetching currencies.',
        });
      }
    };

    fetchCurrencies();
  }, [onChangeFrom, onChangeTo]);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const convertValues = async () => {
      if (convertValue === '') {
        setConvertState({ status: 'idle', value: null, error: null });
        return;
      }
      if (!isConvertValueValid || !selectorFrom || !selectorTo) return;

      setConvertState({ status: 'loading', value: null, error: null });

      try {
        const { value } = await currencyApi.convertCurrencies(
          selectorFrom,
          selectorTo,
          getConvertValueNumber(),
          signal,
        );

        setConvertState({
          status: 'success',
          value,
          error: null,
        });
      } catch (e) {
        if (axios.isCancel(e)) return;

        setConvertState({
          status: 'error',
          value: null,
          error: 'Error while converting currencies.',
        });
      }
    };

    const convertTimer = setTimeout(() => convertValues(), CONVERT_INPUT_DEBOUNCE_MS);

    return () => {
      clearTimeout(convertTimer);
      abortController.abort();
    };
  }, [isConvertValueValid, getConvertValueNumber, selectorFrom, selectorTo, convertValue]);

  // TODO: Add proper visual handling for all statues.

  if (currencyState.status === 'error') {
    return <p>Error: {currencyState.error}</p>;
  }

  if (currencyState.status === 'loading') {
    return <Loader />;
  }

  if (currencyState.status === 'success') {
    const currencies = currencyState.value || [];

    return (
      <div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div>
            <CurrencySelector
              currencies={currencies}
              value={selectorFrom}
              onChange={onChangeFrom}
              label="Convert from:"
            />
            <CurrencyInput
              prefix={selectorFrom}
              placeholder="Enter the amount"
              value={convertValue}
              onChange={onChangeConvertValue}
            />
          </div>
          <div>
            <CurrencySelector
              currencies={currencies}
              value={selectorTo}
              onChange={onChangeTo}
              label="Convert to:"
            />
            <CurrencyInput
              prefix={selectorTo}
              placeholder="Conversion result"
              value={convertState.value?.toString()}
              readOnly={true}
              loading={convertState.status === 'loading'}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
