import { beforeEach, describe, expect, test, vi } from 'vitest';

import axios from '../lib/axios';
import { currencyApi } from './currency';
import type { Currency, CurrencyResponse } from '../types/currency';

vi.mock('../lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const currenciesMap = new Map<string, Currency>([
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

const currenciesResponse: CurrencyResponse = {
  response: [],
};

for (const [, curr] of currenciesMap.entries()) {
  currenciesResponse.response.push(curr);
  currenciesResponse[curr.id - 1] = curr;
}

describe('currencyApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('fetchCurrencies is called with correct params and returns correct results', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: currenciesResponse });
    const result = await currencyApi.fetchCurrencies();

    expect(axios.get).toHaveBeenCalledOnce();
    expect(axios.get).toHaveBeenCalledWith('/currencies');
    expect(result).toStrictEqual(currenciesMap);
  });

  test('convertCurrencies is called with correct params and returns correct results', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { response: { value: 40 } } });
    const { signal } = new AbortController();
    const result = await currencyApi.convertCurrencies('USD', 'PLN', 10, signal);

    expect(axios.get).toHaveBeenCalledOnce();
    expect(axios.get).toHaveBeenCalledWith(
      '/convert?from=USD&to=PLN&amount=10',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    const [, config] = vi.mocked(axios.get).mock.calls[0];
    expect(config?.signal).toBe(signal);
    expect(result.value).toEqual(40);
  });
});
