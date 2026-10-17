import { NumberInput } from '@mantine/core';

type CurrencyInputProps = {
  value?: string;
  onChange?(value: string): void;
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
      onChange={(v) => onChange?.(v.toString())}
      allowNegative={false}
      decimalScale={2}
      readOnly={readOnly}
      loading={loading}
      disabled={disabled}
      label={label}
    />
  );
}
