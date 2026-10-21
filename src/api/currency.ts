import axios from '../lib/axios';
import type { ConvertResponse, Currency, CurrencyResponse } from '../types/currency';

async function fetchCurrencies() {
  const currenciesResponse = await axios.get<CurrencyResponse>('/currencies');
  const currenciesMap = new Map<string, Currency>();

  for (const currency of currenciesResponse.data.response) {
    currenciesMap.set(currency.short_code, currency);
  }

  return currenciesMap;
}

async function convertCurrencies(from: string, to: string, amount: number, signal?: AbortSignal) {
  const convertResponse = await axios.get<ConvertResponse>(
    `/convert?from=${from}&to=${to}&amount=${amount}`,
    { signal },
  );
  return convertResponse.data.response;
}

export const currencyApi = {
  fetchCurrencies,
  convertCurrencies,
};
