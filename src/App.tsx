import '@mantine/core/styles.css';
import { Center, MantineProvider, Stack, Title } from '@mantine/core';

import { CurrencyConvertor } from './views/currency-convertor/CurrencyConvertor';

export function App() {
  return (
    <MantineProvider>
      <Center w="100vw" h="100vh">
        <Stack gap="xl" w={600} h={200}>
          <Title order={1}>Currency Convertor</Title>
          <CurrencyConvertor />
        </Stack>
      </Center>
    </MantineProvider>
  );
}
