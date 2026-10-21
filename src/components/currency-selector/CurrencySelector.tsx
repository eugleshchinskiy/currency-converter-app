import { Select } from '@mantine/core';

type CurrencySelectorProps = {
  currencyOptions: {
    label: string
    value: string
  }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
};

export function CurrencySelector({
  currencyOptions,
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
      data={currencyOptions}
      onChange={onChangeHandler}
      loading={loading}
      disabled={disabled}
      searchable
    />
  );
}
