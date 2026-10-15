import axios from '../lib/axios';
import type { CurrencyResponse } from '../types/currency';

async function fetchCurrencies() {
  const currenciesResponse = await axios.get<CurrencyResponse>('/currencies');
  return currenciesResponse.data.response;
}

export const currencyApi = {
  fetchCurrencies,
};
