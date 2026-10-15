import { useState } from 'react';

export function useCurrencySelectors() {
  const [selectorFrom, setSelectorFrom] = useState('');
  const [selectorTo, setSelectorTo] = useState('');

  function onChangeFrom(val: string) {
    setSelectorFrom(val);
  }

  function onChangeTo(val: string) {
    setSelectorTo(val);
  }

  return {
    selectorFrom,
    selectorTo,
    onChangeFrom,
    onChangeTo,
  };
}
