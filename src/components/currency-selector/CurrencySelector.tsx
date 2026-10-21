import { Select } from '@mantine/core';
import type { Currency } from '../../types/currency';

type CurrencySelectorProps = {
  currencies: Currency[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
};

export function CurrencySelector({
  currencies,
  value,
  onChange,
  label,
  loading,
  disabled,
}: CurrencySelectorProps) {
  const onChangeHandler = (v: string | null) => {
    if (!v) return;
    onChange(v);
  };

  return (
    <Select
      value={value}
      label={label}
      data={currencies.map((c) => c.short_code)}
      onChange={onChangeHandler}
      loading={loading}
      disabled={disabled}
      searchable
    />
  );
}
