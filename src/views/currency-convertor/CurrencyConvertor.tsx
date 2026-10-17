import { Alert, Center, Grid, Loader, Stack, Text } from '@mantine/core';

import { CurrencySelector } from '../../components/currency-selector/CurrencySelector';
import { useCurrencySelectors } from './hooks/useCurrencySelectors';
import { CurrencyInput } from '../../components/currency-input/CurrencyInput';
import { useConvertInput } from './hooks/useCurrencyInputs';
import { useConvertState } from './hooks/useConvertState';
import { useCurrencyState } from './hooks/useCurrencyState';
import { useMemo } from 'react';

export function CurrencyConvertor() {
  const { selectorFrom, selectorTo, onChangeFrom, onChangeTo } = useCurrencySelectors();
  const { convertValue, onChangeConvertValue, isConvertValueValid, getConvertValueNumber } =
    useConvertInput();
  const { convertState } = useConvertState({
    convertValue,
    isConvertValueValid,
    getConvertValueNumber,
    selectorFrom,
    selectorTo,
  });
  const { currencyState } = useCurrencyState({ onChangeFrom, onChangeTo });
  const currencyFrom = useMemo(
    () => currencyState.value?.find(({ short_code }) => short_code === selectorFrom),
    [currencyState.value, selectorFrom],
  );
  const currencyTo = useMemo(
    () => currencyState.value?.find(({ short_code }) => short_code === selectorTo),
    [currencyState.value, selectorTo],
  );

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
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Stack gap="md">
          <CurrencySelector
            currencies={currencies}
            value={selectorFrom}
            onChange={onChangeFrom}
            label="Convert from"
            disabled={!!currencyError}
          />
          <CurrencyInput
            symbol={currencyFrom?.symbol || selectorFrom}
            isSymbolPrefix={currencyFrom?.symbol_first}
            placeholder="Enter the amount"
            value={convertValue}
            onChange={onChangeConvertValue}
            disabled={!!currencyError}
            label="Please enter value below"
          />
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Stack gap="md">
          <CurrencySelector
            currencies={currencies}
            value={selectorTo}
            onChange={onChangeTo}
            label="Convert to"
            disabled={!!currencyError}
          />
          <CurrencyInput
            symbol={currencyTo?.symbol || selectorTo}
            isSymbolPrefix={currencyTo?.symbol_first}
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
