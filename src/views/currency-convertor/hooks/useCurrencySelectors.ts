import { useCallback, useState } from 'react';

export function useCurrencySelectors() {
  const [selectorFrom, setSelectorFrom] = useState('');
  const [selectorTo, setSelectorTo] = useState('');

  const onChangeFrom = useCallback(function (val: string) {
    setSelectorFrom(val);
  }, []);

  const onChangeTo = useCallback(function (val: string) {
    setSelectorTo(val);
  }, []);

  return {
    selectorFrom,
    selectorTo,
    onChangeFrom,
    onChangeTo,
  };
}
