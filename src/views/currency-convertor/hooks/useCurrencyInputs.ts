import { useState } from 'react';

const CURRENCY_REGEX = /^(?:[1-9]\d*(?:\.\d+)?|0\.\d*[1-9]\d*)$/;

export function useConvertInput() {
  const [convertValue, setConvertValue] = useState('');

  function onChangeConvertValue(val: string) {
    setConvertValue(val);
  }

  function isConvertValueValid() {
    return CURRENCY_REGEX.test(convertValue);
  }

  return {
    convertValue,
    onChangeConvertValue,
    isConvertValueValid,
  };
}
