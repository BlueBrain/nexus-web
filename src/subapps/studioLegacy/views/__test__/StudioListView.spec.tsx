import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import StudioListView from '../StudioListView';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import configureStore from '../../../../shared/store';
import fetch from 'node-fetch';
import {
  render,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  screen,
  server,
} from '../../../../utils/testUtil';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

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
                <StudioListView></StudioListView>
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
                <StudioListView></StudioListView>
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

    const search = screen.getByRole('textbox');
    await fireEvent.change(search, { target: { value: 'org1' } });

    // wait spinner to stop spinning.
    // While spinning it will have two items with testId studio-spinner
    await waitFor(() => {
      const items = screen.getAllByTestId('studio-spinner');
      expect(items.length).toBe(1);
    });

    const studios = screen.getAllByRole('listitem');
    expect(studios[1]).toHaveTextContent('1 results');
    expect(studios[0]).toHaveTextContent('org1');
  });
});
