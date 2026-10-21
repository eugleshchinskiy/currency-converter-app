import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AxiosError } from 'axios';

import { currencyApi } from '../../../api/currency';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrencyState } from './useCurrencyState';
import type { Currency } from '../../../types/currency';

vi.mock('../../../api/currency', () => ({
  currencyApi: {
    fetchCurrencies: vi.fn(),
  },
}));

const currenciesResponse = new Map<string, Currency>([
  [
    'USD',
    {
      id: 1,
      short_code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      symbol_first: true,
    },
  ],
  [
    'PLN',
    {
      id: 2,
      short_code: 'PLN',
      name: 'Polish Zloty',
      symbol: 'zł',
      symbol_first: false,
    },
  ],
]);

describe('useCurrencyState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('correctly starts in loading state', () => {
    vi.mocked(currencyApi.fetchCurrencies).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCurrencyState());

    expect(result.current.currencyState.status).toBe('loading');
  });

  test('correctly calls currencies api and sets the response', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue(currenciesResponse);
    const { result } = renderHook(() => useCurrencyState());

    await waitFor(() => expect(result.current.currencyState.status).toBe('success'));

    expect(currencyApi.fetchCurrencies).toHaveBeenCalledOnce();
    expect(result.current.currencyState.value).toStrictEqual(currenciesResponse);
  });

  test('correctly handle empty currencies response', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue(new Map());

    const { result } = renderHook(() => useCurrencyState());

    await waitFor(() => expect(result.current.currencyState.status).toBe('error'));

    expect(result.current.currencyState.error).toBe(
      'Error: no currencies were found. Try again later.',
    );
  });

  test('correctly handles network errors', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockRejectedValue(new AxiosError());

    const { result } = renderHook(() => useCurrencyState());

    await waitFor(() => expect(result.current.currencyState.status).toBe('error'));

    expect(result.current.currencyState.error).toBe(
      'Error while fetching currencies. Try again later.',
    );
  });
});
