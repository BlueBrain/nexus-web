import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
import fetch from 'node-fetch';
import { act } from 'react-dom/test-utils';
import { NexusProvider } from '@bbp/react-nexus';
import { ProjectList, createNexusClient } from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { render, fireEvent, waitFor, screen, server } from 'utils/testUtil';
import configureStore from 'shared/store';
import ProjectsPage, { useInfiniteProjectsQuery } from './ProjectsPage';

describe('ProjectsPage', () => {
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
  xit('renders organization projects in a list', async () => {
    await act(async () => {
      await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <ProjectsPage />
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });

    await waitFor(async () => {
      const projects = await screen.getAllByRole('routeitem-project');
      expect(projects.length).toBe(2);
      const pageTitleExtra = await screen.findAllByText('Total of 2 Projects');
      expect(pageTitleExtra).toBeInTheDocument();
    });
  });

  it('Test inifinite fetching of organisation list', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, waitFor } = renderHook(
      () =>
        useInfiniteProjectsQuery({
          nexus,
          query: '',
          sort: undefined,
        }),
      { wrapper }
    );

    await waitFor(() => result.current.status === 'success');
    expect(result.current.data).toBeTruthy();
    expect((result.current.data?.pages?.[0] as ProjectList)._total).toEqual(4);
  });
});
