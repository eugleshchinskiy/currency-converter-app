type CurrencyInputProps = {
  value?: string;
  onChange?(value: string): void;
  readOnly?: boolean;
};

const CURRENCY_INPUT_REGEX = /^(?:|0|[1-9]\d*)(?:\.\d{0,2})?$/;

export function CurrencyInput({ value, onChange, readOnly }: CurrencyInputProps) {
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (onChange && CURRENCY_INPUT_REGEX.test(val)) {
      onChange(val);
    }
  };

  return (
    <div>
      <input disabled={readOnly} type="text" onChange={onChangeHandler} value={value ?? ''} />
    </div>
  );
}
