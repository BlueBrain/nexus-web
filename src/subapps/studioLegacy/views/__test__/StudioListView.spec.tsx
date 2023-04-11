import '@testing-library/jest-dom';
import fetch from 'node-fetch';
import { act } from 'react-dom/test-utils';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import StudiosPage from '../../../../pages/StudiosPage/StudiosPage';
import configureStore from '../../../../shared/store';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  server,
} from '../../../../utils/testUtil';

describe('StudioListContainer', () => {
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
  xit('renders studios in a list', async () => {
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
      const studios = await screen.getAllByRole('listitem');
      expect(studios.length).toBe(14);
    });
  });

  it('allows user to filter studio list', async () => {
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
      const studios = await screen.getAllByRole('listitem');
      expect(studios.length).toBe(10);
    });

    const search = screen.getByRole('textbox');
    await fireEvent.change(search, { target: { value: 'org1' } });

    // wait spinner to stop spinning.
    // While spinning it will have two items with testId studio-spinner
    // await waitFor(() => {
    //   const items = screen.getAllByTestId('studio-spinner');
    //   expect(items.length).toBe(1);
    // });
    await waitFor(async () => {
      const studios = await screen.getAllByRole('listitem');
      expect(studios[1]).toHaveTextContent('test-label-2');

    });
  });
});
