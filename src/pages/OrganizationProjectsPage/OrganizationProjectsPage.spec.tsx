import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks/dom';
import fetch from 'node-fetch';
import { NexusProvider } from '@bbp/react-nexus';
import {
  Organization,
  ProjectList,
  ProjectResponseCommon,
  createNexusClient,
} from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import { render, waitFor, screen, server } from '../../utils/testUtil';
import { configureStore } from '../../store';
import OrganizationProjectsPage, {
  useInfiniteOrganizationProjectsQuery,
} from './OrganizationProjectsPage';
import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';
import { vi } from 'vitest';

vi.mock('react-router', async () => {
  const actual: Object = await vi.importActual('react-router');
  return {
    ...actual,
    useRouteMatch: vi.fn().mockImplementation(() => {
      return { params: { orgLabel: 'orgLabel' } };
    }),
  };
});

describe('OrganizationProjectsPage', () => {
  const history = createMemoryHistory({});
  // establish API mocking before all tests
  beforeAll(() => {
    server.listen();
  });
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  // clean up once the tests are done
  afterAll(() => {
    server.close();
  });

  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  });
  const queryClient = new QueryClient();
  const store = configureStore(history, { nexus }, {});

  it('renders organization projects in a list', async () => {
    server.use(...[aclHandler, orgProjectsHandler, orgHandler]);

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

    await waitFor(async () => {
      const orgProjects = await screen.findAllByRole('routeitem-org-project');
      expect(orgProjects.length).toBe(2);
      const pageTitleExtra = await screen.findByText('Total of 2 Projects');
      expect(pageTitleExtra).toBeInTheDocument();
    });
  });

  it('Test inifinite fetching of organisation projects', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const orgLabel = 'orgLabel';
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

export const aclHandler = rest.get(
  deltaPath('/acls/:orgLabel'),
  (_, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/acls.json',
      ],
      _total: 1,
      _results: [
        {
          '@id': deltaPath('/v1/acls/org1'),
          '@type': 'AccessControlList',
          acl: [
            {
              identity: {
                '@id': deltaPath('/v1/realms/myrealm/groups/a-group'),
                '@type': 'Group',
                group: 'a-group',
                realm: 'myrealm',
              },
              permissions: ['projects/read'],
            },
            {
              identity: {
                '@id': deltaPath('/v1/realms/realm/groups/some-group'),
                '@type': 'Group',
                group: 'some-group',
                realm: 'realm',
              },
              permissions: ['projects/read', 'projects/write'],
            },
            {
              identity: {
                '@id': deltaPath('/v1/realms/local/users/localuser'),
                '@type': 'User',
                realm: 'local',
                subject: 'localuser',
              },
              permissions: [
                'acls/read',
                'acls/write',
                'resources/read',
                'resources/write',
              ],
            },
          ],
          _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/acls.json',
          _createdAt: '2021-05-11T11:03:06.071Z',
          _createdBy: deltaPath('/v1/anonymous'),
          _deprecated: false,
          _path: '/org1',
          _rev: 1,
          _self: deltaPath('/v1/acls/org1'),
          _updatedAt: '2021-05-11T11:03:06.071Z',
          _updatedBy: deltaPath('/v1/anonymous'),
        },
      ],
    };
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }
);

export const orgProjectsHandler = rest.get(
  deltaPath('/org/orgLabel'),
  (_, res, ctx) => {
    const label = 'orgLabel';
    const mockResponse = [
      {
        '@id': `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${label}/test1-pr1`,
        '@type': 'Project',
        apiMappings: [],
        base: `https://staging.nise.bbp.epfl.ch/nexus/v1/resources/${label}/test1-pr1/`,
        vocab: `https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/${label}/test1-pr1/`,
        _constrainedBy: `https://bluebrain.github.io/nexus/schemas/projects.json`,
        _createdAt: '2023-04-20T10:00:41.803Z',
        _createdBy: `https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah`,
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: `https://bluebrain.github.io/nexus/vocabulary/`,
            _prefix: 'nxv',
          },
          {
            _namespace: `https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex`,
            _prefix: 'documents',
          },
        ],
        _label: 'test1-pr1',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self: `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${label}/test1-pr1`,
        _updatedAt: '2023-04-20T10:53:41.803Z',
        _updatedBy: `https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah`,
        _uuid: '932bc410-0149-4cb5-97cd-4048fb4b07d2',
      },
      {
        '@id': `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${label}/test1-pr2`,
        '@type': 'Project',
        apiMappings: [
          {
            namespace: `https://neuroshapes.org/dash/`,
            prefix: 'datashapes',
          },
        ],
        base: `https://staging.nise.bbp.epfl.ch/nexus/v1/resources/${label}/test1-pr2/_/`,
        description: 'test project 2',
        vocab: `https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/${label}/test1-pr2/`,
        _constrainedBy: `https://bluebrain.github.io/nexus/schemas/projects.json`,
        _createdAt: '2023-04-20T09:27:43.752Z',
        _createdBy: `https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah`,
        _deprecated: false,
        _effectiveApiMappings: [
          {
            _namespace: `https://neuroshapes.org/dash/`,
            _prefix: 'datashapes',
          },
          {
            _namespace: `https://bluebrain.github.io/nexus/vocabulary/`,
            _prefix: 'nxv',
          },
        ],
        _label: 'test1-pr2',
        _markedForDeletion: false,
        _organizationLabel: 'test1',
        _organizationUuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
        _rev: 1,
        _self: `https://staging.nise.bbp.epfl.ch/nexus/v1/projects/${label}/test1-pr2`,
        _updatedAt: '2023-04-20T09:40:46.879Z',
        _updatedBy: `https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/meddah`,
        _uuid: 'b2c8cb70-9163-4a7a-94a6-5641146f56de',
      },
    ];
    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const orgHandler = rest.get(
  deltaPath('/orgs/orgLabel'),
  (_, res, ctx) => {
    const mockResponse: Organization = {
      '@id': 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/orgLabel',
      '@type': 'Organization',
      description: '',
      _constrainedBy:
        'https://bluebrain.github.io/nexus/schemas/organizations.json',
      _createdAt: '2022-06-24T07:52:52.146Z',
      _createdBy:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/orgLabel',
      _deprecated: false,
      _label: 'orgLabel',
      _rev: 1,
      _self: 'https://staging.nise.bbp.epfl.ch/nexus/v1/orgs/Analysis-Plugin',
      _updatedAt: '2023-04-20T07:52:52.146Z',
      _updatedBy:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/orgLabel',
      _uuid: '8ae298d5-ccfd-4412-b066-788c57e328f8',
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/organizations.json',
      ],
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  }
);
