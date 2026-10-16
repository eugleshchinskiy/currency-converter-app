export type Currency = {
  short_code: string;
};

export type CurrencyResponse = {
  response: Currency[];
};

export type ConvertResponse = {
  response: {
    value: number;
  };
};
