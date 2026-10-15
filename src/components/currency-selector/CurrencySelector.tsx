import type { Currency } from '../../types/currency';

type CurrencySelectorProps = {
  currencies: Currency[];
  value: string;
  onChange(value: string): void;
};

export function CurrencySelector({ currencies, value, onChange }: CurrencySelectorProps) {
  const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select value={value} onChange={onChangeHandler}>
      {currencies.map((c) => (
        <option value={c.short_code} key={c.code}>
          {c.short_code}
        </option>
      ))}
    </select>
  );
}
