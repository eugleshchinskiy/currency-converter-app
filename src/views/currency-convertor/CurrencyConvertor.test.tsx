import { act, render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { CurrencyConvertor } from './CurrencyConvertor';
import { currencyApi } from '../../api/currency';
import { MantineProvider } from '@mantine/core';
import { AxiosError } from 'axios';

vi.mock('../../api/currency', () => ({
  currencyApi: {
    fetchCurrencies: vi.fn(),
    convertCurrencies: vi.fn(),
  },
}));

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
  {
    short_code: 'EUR',
    symbol: '€',
    symbol_first: false,
  },
];

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

    expect(fromSelect).toHaveValue('USD');
    expect(toSelect).toHaveValue('PLN');
    expect(enterInput).toHaveValue('');
    expect(resultInput).toHaveValue('');
  });

  test('allows to change From select to different currencies', async () => {
    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const fromSelect = screen.getByRole('combobox', { name: 'Convert from' });
    await user.click(fromSelect);
    const listbox = await screen.findByRole('listbox');
    const euroOption = within(listbox).getByRole('option', { name: 'EUR' });
    await user.click(euroOption);

    expect(fromSelect).toHaveValue('EUR');
  });

  test('allows to change To select to different currencies', async () => {
    const user = userEvent.setup();
    render(prepareRender(<CurrencyConvertor />));

    await waitForElementToBeRemoved(() => screen.getByRole('status'));

    const toSelect = screen.getByRole('combobox', { name: 'Convert to' });
    await user.click(toSelect);
    const listbox = await screen.findByRole('listbox');
    const usdOption = within(listbox).getByRole('option', { name: 'USD' });
    await user.click(usdOption);

    expect(toSelect).toHaveValue('USD');
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
