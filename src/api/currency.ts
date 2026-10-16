import axios from '../lib/axios';
import type { ConvertResponse, CurrencyResponse } from '../types/currency';

async function fetchCurrencies() {
  const currenciesResponse = await axios.get<CurrencyResponse>('/currencies');
  return currenciesResponse.data.response;
}

async function convertCurrencies(from: string, to: string, amount: number) {
  const convertResponse = await axios.get<ConvertResponse>(
    `/convert?from=${from}&to=${to}&amount=${amount}`,
  );
  return convertResponse.data.response;
}

export const currencyApi = {
  fetchCurrencies,
  convertCurrencies,
};
