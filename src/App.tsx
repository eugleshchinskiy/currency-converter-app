import '@mantine/core/styles.css';
import { Center, Container, MantineProvider, Stack, Title } from '@mantine/core';

import { CurrencyConvertor } from './views/currency-convertor/CurrencyConvertor';

export function App() {
  return (
    <MantineProvider>
      <Center w="100vw" h="100vh">
        <Stack bdrs="xs" bd="1px solid gray.4" align="center" justify="center" gap="xl" p="xl">
          <Title order={1}>Currency Convertor</Title>
          <Container mih={180} w={550}>
            <CurrencyConvertor />
          </Container>
        </Stack>
      </Center>
    </MantineProvider>
  );
}
