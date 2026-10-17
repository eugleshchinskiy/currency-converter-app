export type Currency = {
  short_code: string;
  symbol: string;
  symbol_first: boolean;
};

export type CurrencyResponse = {
  response: Currency[];
};

export type ConvertResponse = {
  response: {
    value: number;
  };
};
