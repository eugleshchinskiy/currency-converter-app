import { useCallback, useMemo, useState } from 'react';

const CURRENCY_REGEX = /^(?:[1-9]\d*(?:\.\d+)?|0\.\d*[1-9]\d*)$/;

export function useConvertInput() {
  const [convertValue, setConvertValue] = useState('');

  const onChangeConvertValue = useCallback(function (val: string) {
    setConvertValue(val);
  }, []);

  const isConvertValueValid = useMemo(
    function () {
      return CURRENCY_REGEX.test(convertValue);
    },
    [convertValue],
  );

  const getConvertValueNumber = useCallback(() => {
    if (!isConvertValueValid) return 0;

    return Number.parseFloat(convertValue);
  }, [isConvertValueValid, convertValue]);

  return {
    convertValue,
    onChangeConvertValue,
    isConvertValueValid,
    getConvertValueNumber,
  };
}
