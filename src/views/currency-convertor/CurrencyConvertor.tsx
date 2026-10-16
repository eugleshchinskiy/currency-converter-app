import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { Alert, Center, Grid, Loader, Stack, Text } from '@mantine/core';

import { currencyApi } from '../../api/currency';
import type { Currency } from '../../types/currency';
import { CurrencySelector } from '../../components/currency-selector/CurrencySelector';
import { useCurrencySelectors } from './hooks/useCurrencySelectors';
import { CurrencyInput } from '../../components/currency-input/CurrencyInput';
import { useConvertInput } from './hooks/useCurrencyInputs';
import type { GenericAsyncState } from '../../types/state';
import axios from '../../lib/axios';

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
  }, [isConvertValueValid, getConvertValueNumber, selectorFrom, selectorTo, convertValue]);

  if (currencyState.status === 'loading') {
    return (
      <Center>
        <Loader mt="xl" type="dots" size="xl" />
      </Center>
    );
  }

  const currencies = currencyState.value || [];
  const currencyError = currencyState.error;
  const convertError = convertState.error;
  const hasErrors = currencyError || convertError;

  return (
    <Grid>
      <Grid.Col span={6}>
        <Stack gap="md">
          <CurrencySelector
            currencies={currencies}
            value={selectorFrom}
            onChange={onChangeFrom}
            label="Convert from"
            disabled={!!currencyError}
          />
          <CurrencyInput
            prefix={selectorFrom}
            placeholder="Enter the amount"
            value={convertValue}
            onChange={onChangeConvertValue}
            disabled={!!currencyError}
            label="Please enter value below"
          />
        </Stack>
      </Grid.Col>

      <Grid.Col span={6}>
        <Stack gap="md">
          <CurrencySelector
            currencies={currencies}
            value={selectorTo}
            onChange={onChangeTo}
            label="Convert to"
            disabled={!!currencyError}
          />
          <CurrencyInput
            prefix={selectorTo}
            placeholder="Conversion result"
            value={convertState.value?.toString()}
            readOnly={true}
            loading={convertState.status === 'loading'}
            label="Conversion result"
          />
        </Stack>
      </Grid.Col>
      {hasErrors && (
        <Grid.Col span={12}>
          <Alert variant="light" color="red" radius="sm">
            <Text>{currencyError}</Text>
            <Text>{convertError}</Text>
          </Alert>
        </Grid.Col>
      )}
    </Grid>
  );
}
