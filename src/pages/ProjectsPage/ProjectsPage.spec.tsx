import '@testing-library/jest-dom';

import { createNexusClient, ProjectList } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import { renderHook } from '@testing-library/react-hooks/dom';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import fetch from 'node-fetch';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';

import { configureStore } from '../../store';
import { render, screen, server } from '../../utils/testUtil';
import ProjectsPage, { useInfiniteProjectsQuery } from './ProjectsPage';
import { aclHandler, infiniteProjectsHandler } from './ProjectsPageHandlers';

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

  it('renders organization projects in a list', async () => {
    server.use(infiniteProjectsHandler);
    server.use(aclHandler);

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

    const projects = await screen.findAllByRole('routeitem-project');
    expect(projects.length).toBe(2);

    const pageTitleExtra = await screen.findByText('Total of 2 Projects');
    expect(pageTitleExtra).toBeInTheDocument();
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
