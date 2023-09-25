import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks/dom';
import fetch from 'node-fetch';
import { NexusProvider } from '@bbp/react-nexus';
import { OrganizationList, createNexusClient } from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { render, screen, server } from '../../utils/testUtil';
import OrganizationListPage, {
  useInfiniteOrganizationQuery,
} from './OrganizationListPage';
import { configureStore } from '../../store';
import {
  orgProjectsHandler,
  orgHandler,
  orgsHandler,
} from '../OrganizationProjectsPage/OrganizationProjectsPage.spec';
import { vi } from 'vitest';
import { aclHandler } from '../ProjectsPage/ProjectsPageHandlers';
import { setupServer } from 'msw/node';

vi.mock('react-router', async () => {
  const actual: Object = await vi.importActual('react-router');
  return {
    ...actual,
    useRouteMatch: vi.fn().mockImplementation(() => {
      return { params: { orgLabel: 'orgLabel' } };
    }),
  };
});

describe('OrganizationListPage', () => {
  const history = createMemoryHistory({});
  const server = setupServer();
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
    server.use(...[aclHandler, orgProjectsHandler, orgHandler, orgsHandler]);

    await render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <NexusProvider nexusClient={nexus}>
            <QueryClientProvider client={queryClient}>
              <OrganizationListPage />
            </QueryClientProvider>
          </NexusProvider>
        </ConnectedRouter>
      </Provider>
    );

    const organizations = await screen.findAllByRole('routeitem-org');
    expect(organizations.length).toEqual(3);
    const pageTitleExtra = await screen.findByText('Total of 3 Organizations');
    expect(pageTitleExtra).toBeInTheDocument();
  });

  it('Test inifinite fetching of organisation list', async () => {
    server.use(...[aclHandler, orgProjectsHandler, orgHandler, orgsHandler]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, waitFor } = renderHook(
      () =>
        useInfiniteOrganizationQuery({
          nexus,
          query: '',
          sort: 'asc',
        }),
      { wrapper }
    );
    await waitFor(() => result.current.status === 'success');
    expect(result.current.data).toBeTruthy();
    expect(
      (result.current.data?.pages?.[0] as OrganizationList)._total
    ).toEqual(3);
  });
});
