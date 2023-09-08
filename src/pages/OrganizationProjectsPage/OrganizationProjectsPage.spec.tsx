import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks/dom';
import fetch from 'node-fetch';
import { act } from 'react-dom/test-utils';
import { NexusProvider } from '@bbp/react-nexus';
import {
  ProjectList,
  ProjectResponseCommon,
  createNexusClient,
} from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import { render, waitFor, screen, server } from '../../utils/testUtil';
import { configureStore } from '../../store';
import OrganizationProjectsPage, {
  useInfiniteOrganizationProjectsQuery,
} from './OrganizationProjectsPage';

describe('OrganizationProjectsPage', () => {
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
    await act(async () => {
      await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <OrganizationProjectsPage />
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });

    await waitFor(async () => {
      const orgProjects = await screen.getAllByRole('routeitem-org-project');
      expect(orgProjects.length).toBe(2);
      const pageTitleExtra = await screen.findAllByText('Total of 2 Projects');
      expect(pageTitleExtra).toBeInTheDocument();
    });
  });

  it('Test inifinite fetching of organisation projects', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const orgLabel = 'test-2';
    const { result, waitFor } = renderHook(
      () =>
        useInfiniteOrganizationProjectsQuery({
          nexus,
          orgLabel,
          query: '',
          sort: 'asc',
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => result.current.status === 'success');
    expect(result.current.data).toBeTruthy();
    expect((result.current.data?.pages?.[0] as ProjectList)._total).toEqual(2);
    expect(
      (result.current.data?.pages?.[0] as ProjectList)._results.map(
        (item: ProjectResponseCommon) => item._label
      )
    ).toContain(orgLabel);
  });
});
