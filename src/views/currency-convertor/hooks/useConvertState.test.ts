import { describe, expect, test, afterEach, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AxiosError } from 'axios';

import { useConvertState, type UseConvertStateParams } from './useConvertState';
import { currencyApi } from '../../../api/currency';

vi.mock('../../../api/currency', () => ({
  currencyApi: {
    convertCurrencies: vi.fn(),
  },
}));

const baseProps: UseConvertStateParams = {
  convertValue: '',
  isConvertValueValid: false,
  convertValueNumber: null,
  selectorFrom: 'USD',
  selectorTo: 'PLN',
};

describe('useConvertState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(currencyApi.convertCurrencies).mockResolvedValue({ value: 40 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should have idle state when initiated', () => {
    const { result } = renderHook(() => useConvertState(baseProps));

    expect(currencyApi.convertCurrencies).not.toHaveBeenCalled();
    expect(result.current.convertState).toStrictEqual({
      status: 'idle',
      value: null,
      error: null,
    });
  });

  test('should call the convert api with correct params and correctly change states', async () => {
    vi.mocked(currencyApi.convertCurrencies).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ value: 40 }), 200);
      });
    });

    const { result, rerender } = renderHook((props) => useConvertState(props), {
      initialProps: baseProps,
    });

    expect(result.current.convertState.status).toBe('idle');

    rerender({
      ...baseProps,
      convertValue: '10',
      isConvertValueValid: true,
      convertValueNumber: 10,
    });

    expect(currencyApi.convertCurrencies).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.convertState.status).toBe('loading');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(currencyApi.convertCurrencies).toHaveBeenCalledTimes(1);
    expect(currencyApi.convertCurrencies).toHaveBeenCalledWith(
      'USD',
      'PLN',
      10,
      expect.any(AbortSignal),
    );
    expect(result.current.convertState).toEqual({
      status: 'success',
      value: 40,
      error: null,
    });
  });

  test('should not call the convert api when currencies are equal', async () => {
    const { result, rerender } = renderHook((props) => useConvertState(props), {
      initialProps: baseProps,
    });

    expect(result.current.convertState.status).toBe('idle');

    rerender({
      ...baseProps,
      selectorFrom: 'USD',
      selectorTo: 'USD',
      convertValue: '10',
      isConvertValueValid: true,
      convertValueNumber: 10,
    });

    expect(currencyApi.convertCurrencies).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(currencyApi.convertCurrencies).not.toHaveBeenCalled();
    expect(result.current.convertState).toEqual({
      status: 'success',
      value: 10,
      error: null,
    });
  });

  test('should handle an api error', async () => {
    vi.mocked(currencyApi.convertCurrencies).mockImplementation(() => {
      throw new AxiosError();
    });

    const { result, rerender } = renderHook((props) => useConvertState(props), {
      initialProps: baseProps,
    });

    expect(result.current.convertState.status).toBe('idle');

    rerender({
      ...baseProps,
      convertValue: '10',
      isConvertValueValid: true,
      convertValueNumber: 10,
    });

    expect(currencyApi.convertCurrencies).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(currencyApi.convertCurrencies).toHaveBeenCalledTimes(1);
    expect(currencyApi.convertCurrencies).toThrow(expect.any(AxiosError));
    expect(result.current.convertState).toEqual({
      status: 'error',
      value: null,
      error: 'Error while converting currencies. Try again later.',
    });
  });
});
