import { NumberInput } from '@mantine/core';

type CurrencyInputProps = {
  value?: string | number;
  onChange?(value: string | number): void;
  readOnly?: boolean;
  symbol?: string;
  isSymbolPrefix?: boolean;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
};

export function CurrencyInput({
  value,
  onChange,
  placeholder,
  symbol,
  isSymbolPrefix,
  readOnly,
  loading,
  disabled,
  label,
}: CurrencyInputProps) {
  return (
    <NumberInput
      placeholder={placeholder}
      prefix={isSymbolPrefix ? `${symbol} ` : undefined}
      suffix={isSymbolPrefix ? undefined : ` ${symbol}`}
      value={value}
      onChange={onChange}
      allowNegative={false}
      decimalScale={2}
      readOnly={readOnly}
      loading={loading}
      disabled={disabled}
      label={label}
    />
  );
}
