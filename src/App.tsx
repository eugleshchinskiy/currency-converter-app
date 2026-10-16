import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

import { CurrencyConvertor } from './views/currency-convertor/CurrencyConvertor';

export function App() {
  return (
    <MantineProvider>
      <CurrencyConvertor />
    </MantineProvider>
  );
}
