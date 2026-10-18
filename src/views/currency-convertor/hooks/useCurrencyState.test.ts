import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AxiosError } from 'axios';

import { currencyApi } from '../../../api/currency';
import { renderHook, waitFor } from '@testing-library/react';
import { DEFAULT_FROM, DEFAULT_TO, useCurrencyState } from './useCurrencyState';

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
    vi.mocked(currencyApi.fetchCurrencies).mockReturnValue(new Promise(() => {}));

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

    await waitFor(() => expect(result.current.currencyState.status).toBe('success'));

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

    await waitFor(() => expect(result.current.currencyState.status).toBe('success'));

    expect(onChangeFromMock).toHaveBeenCalledOnce();
    expect(onChangeFromMock).toHaveBeenCalledWith(DEFAULT_FROM);
    expect(onChangeToMock).toHaveBeenCalledOnce();
    expect(onChangeToMock).toHaveBeenCalledWith(DEFAULT_TO);
  });

  test('correctly handle empty currencies response', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useCurrencyState({
        onChangeFrom: onChangeFromMock,
        onChangeTo: onChangeToMock,
      }),
    );

    console.log(result);

    await waitFor(() => expect(result.current.currencyState.status).toBe('error'));

    expect(result.current.currencyState.error).toBe(
      'Error: no currencies were found. Try again later.',
    );
  });

  test('correctly handle missing default values in currencies response', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue([
      {
        short_code: 'EUR',
        symbol: '€',
        symbol_first: false,
      },
    ]);

    const { result } = renderHook(() =>
      useCurrencyState({
        onChangeFrom: onChangeFromMock,
        onChangeTo: onChangeToMock,
      }),
    );

    await waitFor(() => expect(result.current.currencyState.status).toBe('success'));

    expect(onChangeFromMock).toHaveBeenCalledOnce();
    expect(onChangeFromMock).toHaveBeenCalledWith('EUR');
    expect(onChangeToMock).toHaveBeenCalledOnce();
    expect(onChangeToMock).toHaveBeenCalledWith('EUR');
  });

  test('correctly handles network errors', async () => {
    vi.mocked(currencyApi.fetchCurrencies).mockRejectedValue(new AxiosError());

    const { result } = renderHook(() =>
      useCurrencyState({
        onChangeFrom: onChangeFromMock,
        onChangeTo: onChangeToMock,
      }),
    );

    await waitFor(() => expect(result.current.currencyState.status).toBe('error'));

    expect(result.current.currencyState.error).toBe(
      'Error while fetching currencies. Try again later.',
    );
  });
});
