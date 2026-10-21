export type Currency = {
  id: number;
  name: string;
  short_code: string;
  symbol: string;
  symbol_first: boolean;
};

export type CurrencyResponse = {
  [id: number]: Currency;
  response: Currency[];
};

export type ConvertResponse = {
  response: {
    value: number;
  };
};
