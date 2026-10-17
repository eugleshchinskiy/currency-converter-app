import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AxiosError } from 'axios';

import { currencyApi } from '../../../api/currency';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrencyState } from './useCurrencyState';

vi.mock('../../../api/currency', () => ({
  currencyApi: {
    fetchCurrencies: vi.fn(),
  },
}));

const onChangeFromMock = vi.fn();
const onChangeToMock = vi.fn();

const currenciesResponse = [
  {
    short_code: 'USD',
    symbol: '$',
    symbol_first: true,
  },
  {
    short_code: 'PLN',
    symbol: 'zł',
    symbol_first: false,
  },
];

describe('useCurrencyState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('correctly starts in idle state and transitions to loading', () => {
    const statuses: string[] = [];

    renderHook(() => {
      const value = useCurrencyState({
        onChangeFrom: onChangeFromMock,
        onChangeTo: onChangeToMock,
      });
      statuses.push(value.currencyState.status);
      return value;
    });

    expect(statuses[0]).toBe('idle');
    expect(statuses[1]).toBe('loading');
  });

  test('correctly calls currencies api and sets the response', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue(currenciesResponse);
    const { result } = renderHook(() =>
      useCurrencyState({
        onChangeFrom: onChangeFromMock,
        onChangeTo: onChangeToMock,
      }),
    );

    await waitFor(() => result.current.currencyState.status === 'success');

    expect(currencyApi.fetchCurrencies).toHaveBeenCalledOnce();
    expect(result.current.currencyState.value).toStrictEqual(currenciesResponse);
  });

  test('correctly sets default values from currencies response', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue(currenciesResponse);

    const { result } = renderHook(() =>
      useCurrencyState({
        onChangeFrom: onChangeFromMock,
        onChangeTo: onChangeToMock,
      }),
    );

    await waitFor(() => result.current.currencyState.status === 'success');

    expect(onChangeFromMock).toHaveBeenCalledOnce();
    expect(onChangeFromMock).toHaveBeenCalledWith('USD');
    expect(onChangeToMock).toHaveBeenCalledOnce();
    expect(onChangeToMock).toHaveBeenCalledWith('PLN');
  });

  test('correctly handles network errors', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockRejectedValue(new AxiosError());

    const { result } = renderHook(() =>
      useCurrencyState({
        onChangeFrom: onChangeFromMock,
        onChangeTo: onChangeToMock,
      }),
    );

    await waitFor(() => result.current.currencyState.status === 'error');

    expect(result.current.currencyState.error).toBe(
      'Error while fetching currencies. Try again later.',
    );
  });
});
