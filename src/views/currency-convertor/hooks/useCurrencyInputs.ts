import { useState } from 'react';

export function useConvertInput() {
  const [convertValue, setConvertValue] = useState<string | number>('');

  const convertValueNumber =
    typeof convertValue === 'number' && convertValue > 0 ? convertValue : null;

  return {
    convertValue,
    onChangeConvertValue: setConvertValue,
    convertValueNumber,
    isConvertValueValid: convertValueNumber !== null,
  };
}
