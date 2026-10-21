import { act, render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';

import { CurrencyConvertor } from './CurrencyConvertor';
import { currencyApi } from '../../api/currency';
import { MantineProvider } from '@mantine/core';
import type { Currency } from '../../types/currency';

vi.mock('../../api/currency', () => ({
  currencyApi: {
    fetchCurrencies: vi.fn(),
    convertCurrencies: vi.fn(),
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
  [
    'EUR',
    {
      id: 3,
      short_code: 'EUR',
      name: 'Euro',
      symbol: '€',
      symbol_first: false,
    },
  ],
]);

function prepareRender(child: React.ReactNode) {
  return <MantineProvider env="test">{child}</MantineProvider>;
}

describe('CurrencyConvertor', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue(currenciesResponse);
  });

  test('renders loading indicator while currencies are being fetched', () => {
    vi.mocked(currencyApi.fetchCurrencies).mockImplementationOnce(() => new Promise(() => {}));
    render(prepareRender(<CurrencyConvertor />));

    const loadingSpinner = screen.getByRole('status');

    expect(loadingSpinner).toBeInTheDocument();
  });

  test('renders the form successfully once currencies are fetched', async () => {
    render(prepareRender(<CurrencyConvertor />));

    // wait loading spinner to be removed
    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const [fromSelect, toSelect] = screen.getAllByRole('combobox');
    const enterInput = screen.getByPlaceholderText('Enter the amount');
    const resultInput = screen.getByPlaceholderText('Conversion result');

    expect(fromSelect).toHaveValue('US Dollar (USD)');
    expect(toSelect).toHaveValue('Polish Zloty (PLN)');
    expect(enterInput).toHaveValue('');
    expect(resultInput).toHaveValue('');
  });

  test('renders the form successfully once currencies are fetched and defaults are missing', async () => {
    // usd and pln are missing - eur will be selected (the first item in the map)
    const mapWithOnlyEur = new Map(currenciesResponse);
    mapWithOnlyEur.delete('USD');
    mapWithOnlyEur.delete('PLN');

    vi.mocked(currencyApi.fetchCurrencies).mockResolvedValue(mapWithOnlyEur);

    render(prepareRender(<CurrencyConvertor />));

    // wait loading spinner to be removed
    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const [fromSelect, toSelect] = screen.getAllByRole('combobox');

    expect(fromSelect).toHaveValue('Euro (EUR)');
    expect(toSelect).toHaveValue('Euro (EUR)');
  });

  test('allows to change From select to different currencies', async () => {
    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const fromSelect = screen.getByRole('combobox', { name: 'Convert from' });
    await user.click(fromSelect);
    const listbox = await screen.findByRole('listbox');
    const euroOption = within(listbox).getByRole('option', { name: 'Euro (EUR)' });
    await user.click(euroOption);

    expect(fromSelect).toHaveValue('Euro (EUR)');
  });

  test('allows to change To select to different currencies', async () => {
    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const toSelect = screen.getByRole('combobox', { name: 'Convert to' });
    await user.click(toSelect);
    const listbox = await screen.findByRole('listbox');
    const usdOption = within(listbox).getByRole('option', { name: 'US Dollar (USD)' });
    await user.click(usdOption);

    expect(toSelect).toHaveValue('US Dollar (USD)');
  });

  test('allows to input values', async () => {
    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const convertValueInput = screen.getByPlaceholderText('Enter the amount');
    await user.type(convertValueInput, '100');

    expect(convertValueInput).toHaveValue('$ 100'); // prefix and value
  });

  test('does not allow to change read only convert input values', async () => {
    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const convertResultInput = screen.getByPlaceholderText('Conversion result');
    await user.type(convertResultInput, '100');

    expect(convertResultInput).toHaveValue('');
    expect(convertResultInput).toHaveAttribute('readonly');
  });

  test('correctly displays converted value', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(currencyApi.convertCurrencies).mockResolvedValueOnce({ value: 50 });

    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const convertValueInput = screen.getByPlaceholderText('Enter the amount');
    const convertResultInput = screen.getByPlaceholderText('Conversion result');
    await user.type(convertValueInput, '100');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(convertValueInput).toHaveValue('$ 100');
    expect(convertResultInput).toHaveValue('50 zł');
    vi.useRealTimers();
  });

  test('correctly handles 0 value edge case', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(currencyApi.convertCurrencies).mockResolvedValueOnce({ value: 50 });

    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const convertValueInput = screen.getByPlaceholderText('Enter the amount');
    const convertResultInput = screen.getByPlaceholderText('Conversion result');
    await user.type(convertValueInput, '0');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(convertValueInput).toHaveValue('$ 0');
    expect(convertResultInput).toHaveValue('');
    expect(currencyApi.convertCurrencies).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test('correctly handles entered non numeric value', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(currencyApi.convertCurrencies).mockResolvedValueOnce({ value: 50 });

    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const convertValueInput = screen.getByPlaceholderText('Enter the amount');
    const convertResultInput = screen.getByPlaceholderText('Conversion result');
    await user.type(convertValueInput, 'abc');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(convertValueInput).toHaveValue('');
    expect(convertResultInput).toHaveValue('');
    expect(currencyApi.convertCurrencies).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test('correctly handles network errors', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(currencyApi.convertCurrencies).mockImplementation(() => {
      throw new AxiosError();
    });

    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const convertValueInput = screen.getByPlaceholderText('Enter the amount');
    const convertResultInput = screen.getByPlaceholderText('Conversion result');
    await user.type(convertValueInput, '100');

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(
      screen.getByText('Error while converting currencies. Try again later.'),
    ).toBeInTheDocument();
    expect(convertValueInput).toHaveValue(`$ 100`);
    expect(convertResultInput).toHaveValue('');
    vi.useRealTimers();
  });
});
