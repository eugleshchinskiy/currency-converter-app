import '@mantine/core/styles.css';
import { Card, Box, Center, MantineProvider, Title } from '@mantine/core';

import { CurrencyConvertor } from './views/currency-convertor/CurrencyConvertor';

export function App() {
  return (
    <MantineProvider>
      <Center mih="100vh" p={{ base: 'md', sm: 'xl' }}>
        <Card withBorder w="100%" maw={600}>
          <Card.Section withBorder>
            <Box px={{ base: 'md', sm: 'xl' }} py={{ base: 'xs', sm: 'md' }}>
              <Title order={1}>Currency Converter</Title>
            </Box>
          </Card.Section>

          <Card.Section>
            <Box p={{ base: 'md', sm: 'xl' }}>
              <CurrencyConvertor />
            </Box>
          </Card.Section>
        </Card>
      </Center>
    </MantineProvider>
  );
}
