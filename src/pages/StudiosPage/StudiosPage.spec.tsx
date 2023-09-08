import '@testing-library/jest-dom';
import fetch from 'node-fetch';
import { act } from 'react-dom/test-utils';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  server,
} from '../../utils/testUtil';
import { configureStore } from '../../store';
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
