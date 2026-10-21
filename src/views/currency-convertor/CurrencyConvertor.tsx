import { useMemo, useState } from 'react';
import { Alert, Center, Grid, Loader, Stack, Text } from '@mantine/core';

import { CurrencySelector } from '../../components/currency-selector/CurrencySelector';
import { CurrencyInput } from '../../components/currency-input/CurrencyInput';
import { useConvertState } from './hooks/useConvertState';
import { useCurrencyState } from './hooks/useCurrencyState';

export const DEFAULT_FROM = 'USD';
export const DEFAULT_TO = 'PLN';

export function CurrencyConvertor() {
  const [amount, setAmount] = useState<string | number>('');
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');

  const { currencyState } = useCurrencyState();
  const currencies = currencyState.value || [];
  const hasDefault = (defaultCode: string) =>
    currencies.some(({ short_code }) => short_code === defaultCode);
  const currencyFrom =
    selectedFrom || (hasDefault(DEFAULT_FROM) ? DEFAULT_FROM : currencies[0]?.short_code || '');
  const currencyTo =
    selectedTo || (hasDefault(DEFAULT_TO) ? DEFAULT_TO : currencies[0]?.short_code || '');

  const { convertState } = useConvertState({
    selectorFrom: currencyFrom,
    selectorTo: currencyTo,
    amount,
  });

  const currencyFromObj = useMemo(
    () => currencyState.value?.find(({ short_code }) => short_code === currencyFrom),
    [currencyState.value, currencyFrom],
  );
  const currencyToObj = useMemo(
    () => currencyState.value?.find(({ short_code }) => short_code === currencyTo),
    [currencyState.value, currencyTo],
  );

  if (currencyState.status === 'loading') {
    return (
      <Center>
        <Loader role="status" mt="xl" type="dots" size="xl" />
      </Center>
    );
  }

  const currencyError = currencyState.error;
  const convertError = convertState.error;
  const hasErrors = currencyError || convertError;

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Stack gap="md">
          <CurrencySelector
            currencies={currencies}
            value={currencyFrom}
            onChange={setSelectedFrom}
            label="Convert from"
            disabled={!!currencyError}
          />
          <CurrencyInput
            symbol={currencyFromObj?.symbol || currencyFrom}
            isSymbolPrefix={currencyFromObj?.symbol_first}
            placeholder="Enter the amount"
            value={amount}
            onChange={setAmount}
            disabled={!!currencyError}
            label="Please enter value below"
          />
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Stack gap="md">
          <CurrencySelector
            currencies={currencies}
            value={currencyTo}
            onChange={setSelectedTo}
            label="Convert to"
            disabled={!!currencyError}
          />
          <CurrencyInput
            symbol={currencyToObj?.symbol || selectedTo}
            isSymbolPrefix={currencyToObj?.symbol_first}
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
