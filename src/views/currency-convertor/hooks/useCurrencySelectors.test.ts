import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useCurrencySelectors } from './useCurrencySelectors';

describe('useCurrencySelectors', () => {
  test('should correctly handle default input state', () => {
    const { result } = renderHook(() => useCurrencySelectors());

    expect(result.current.selectorFrom).toEqual('');
    expect(result.current.selectorTo).toEqual('');
  });

  test('should correctly handle from input change', () => {
    const { result } = renderHook(() => useCurrencySelectors());

    act(() => {
      result.current.onChangeFrom('USD');
    });

    expect(result.current.selectorFrom).toEqual('USD');
  });

  test('should correctly handle to input change', () => {
    const { result } = renderHook(() => useCurrencySelectors());

    act(() => {
      result.current.onChangeTo('PLN');
    });

    expect(result.current.selectorTo).toEqual('PLN');
  });
});
