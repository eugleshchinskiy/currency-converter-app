import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useConvertInput } from './useConvertInput';

describe('useConvertInput', () => {
  test('should correctly handle default input state', () => {
    const { result } = renderHook(() => useConvertInput());

    expect(result.current).toStrictEqual({
      convertValue: '',
      onChangeConvertValue: expect.any(Function),
      convertValueNumber: null,
      isConvertValueValid: false,
    });
  });

  test('should correctly handle input change', () => {
    const { result } = renderHook(() => useConvertInput());

    act(() => {
      result.current.onChangeConvertValue(10);
    });

    expect(result.current.convertValueNumber).toEqual(10);
    expect(result.current.isConvertValueValid).toEqual(true);
  });

  test('should correctly handle invalid value change', () => {
    const { result } = renderHook(() => useConvertInput());

    act(() => {
      result.current.onChangeConvertValue('0');
    });

    expect(result.current.convertValueNumber).toEqual(null);
    expect(result.current.isConvertValueValid).toEqual(false);
  });
});
