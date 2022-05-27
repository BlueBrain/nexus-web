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

    const studios = screen.getAllByRole('listitem');
    expect(studios.length).toBe(4);
    expect(studios[0]).toHaveTextContent('test-label-1');
  });

  xit('allows user to filter studio list', async () => {
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
    const studios = screen.getAllByRole('listitem');
    expect(studios.length).toBe(4);
    expect(studios[0]).toHaveTextContent('test-label-1');

    const search = screen.getByRole('textbox');
    await fireEvent.change(search, { target: { value: 'test' } });

    await act(async () => {
      await fireEvent.change(search, { target: { value: 'label for id-1' } });
      await waitFor(() => {
        const items = screen.getAllByText('label for id-1');
        expect(items[0]).toBeVisible();
      });
    });
    waitFor(async () => {
      await screen.getAllByRole('listitem');
      const studios2 = await screen.getAllByRole('listitem');
      expect(studios2[0]).toHaveTextContent('test-label-2');
      expect(studios2.length).toBe(1);
    });
  });
});
