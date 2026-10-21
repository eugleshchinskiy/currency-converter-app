import { useState } from 'react';
import { Alert, Center, Grid, Loader, Stack, Text } from '@mantine/core';

import { CurrencySelector } from '../../components/currency-selector/CurrencySelector';
import { CurrencyInput } from '../../components/currency-input/CurrencyInput';
import { useConvertState } from './hooks/useConvertState';
import { useCurrencyState } from './hooks/useCurrencyState';
import type { Currency } from '../../types/currency';

export const DEFAULT_FROM = 'USD';
export const DEFAULT_TO = 'PLN';

export function CurrencyConvertor() {
  const [amount, setAmount] = useState<string | number>('');
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');

  const { currencyState } = useCurrencyState();
  const currencies = currencyState.value || new Map<string, Currency>();

  const pickCurrency = (selected: string, fallback: string) =>
    selected || (currencies.has(fallback) ? fallback : currencies.keys().next().value || '');

  const fromCode = pickCurrency(selectedFrom, DEFAULT_FROM);
  const toCode = pickCurrency(selectedTo, DEFAULT_TO);

  const { convertState } = useConvertState({
    from: fromCode,
    to: toCode,
    amount,
  });

  const fromCurrency = currencies.get(fromCode);
  const toCurrency = currencies.get(toCode);

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

  const currencyOptions = [...currencies.entries()].map(([code, curr]) => ({
    label: `${curr.name} (${curr.short_code})`,
    value: code,
  }));

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Stack gap="md">
          <CurrencySelector
            currencyOptions={currencyOptions}
            value={fromCode}
            onChange={setSelectedFrom}
            label="Convert from"
            disabled={!!currencyError}
          />
          <CurrencyInput
            symbol={fromCurrency?.symbol || fromCode}
            isSymbolPrefix={fromCurrency?.symbol_first}
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
            currencyOptions={currencyOptions}
            value={toCode}
            onChange={setSelectedTo}
            label="Convert to"
            disabled={!!currencyError}
          />
          <CurrencyInput
            symbol={toCurrency?.symbol || toCode}
            isSymbolPrefix={toCurrency?.symbol_first}
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
            {currencyError && <Text>{currencyError}</Text>}
            {convertError && <Text>{convertError}</Text>}
          </Alert>
        </Grid.Col>
      )}
    </Grid>
  );
}
