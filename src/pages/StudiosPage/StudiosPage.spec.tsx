import '@testing-library/jest-dom';

import { createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import fetch from 'node-fetch';
import { act } from 'react-dom/test-utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';

import { configureStore } from '../../store';
import { fireEvent, render, screen, server, waitFor } from '../../utils/testUtil';
import StudiosPage from './StudiosPage';

describe('StudiosPage', () => {
  const history = createBrowserHistory({ basename: '/' });

  // establish API mocking before all tests
  beforeAll(() => {
    server.listen();
  });
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers());
  // clean up once the tests are done
  afterAll(() => server.close());

  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  });
  const queryClient = new QueryClient();
  const store = configureStore(history, { nexus }, {});
  it('renders studios in a list', async () => {
    await act(async () => {
      await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudiosPage />
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });

    await waitFor(async () => {
      const studios = await screen.getAllByRole('routeitem-studio');
      expect(studios.length).not.toBe(10);
      // const pageTitleExtra = await screen.findAllByText('Total of 19 Projects')
      // expect(pageTitleExtra).toBeInTheDocument();
    });
  });
});
