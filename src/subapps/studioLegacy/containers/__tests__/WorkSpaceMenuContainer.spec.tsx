import * as React from 'react';
import StudioReactContext, {
  StudioContextType,
} from '../../contexts/StudioContext';
import { NexusProvider } from '@bbp/react-nexus';
import { createBrowserHistory } from 'history';
import { createNexusClient } from '@bbp/nexus-sdk';
import WorkSpaceMenu, { StudioResource } from '../WorkspaceMenuContainer';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConnectedRouter } from 'connected-react-router';
import configureStore from '../../../../shared/store';
import { Provider } from 'react-redux';
import fetch from 'node-fetch';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  server,
} from '../../../../utils/testUtil';
import { rest } from 'msw';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
describe('workSpaceMenu', () => {
  const history = createBrowserHistory({ basename: '/' });
  const contextValue: StudioContextType = {
    orgLabel: 'org',
    projectLabel: 'project',
    studioId: 'studio1',
    isWritable: true,
  };
  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  });
  const store = configureStore(history, { nexus }, {});
  const resource = ({
    '@context': [
      'https://bluebrain.github.io/nexus/contexts/metadata.json',
      'https://bluebrainnexus.io/studio/context',
    ],
    '@id': 'studio1',
    '@type': 'Studio',
    description: '',
    label: 'SSCx portal data',
    plugins: [
      {
        customise: true,
        plugins: [
          { expanded: false, key: 'video' },
          { expanded: false, key: 'preview' },
          { expanded: false, key: 'admin' },
          { expanded: false, key: 'circuit' },
          { expanded: false, key: 'image-collection-viewer' },
          { expanded: false, key: 'jira' },
          { expanded: false, key: 'markdown' },
        ],
      },
    ],
    workspaces: ['w1'],
    _project: 'org/project',
    _constrainedBy:
      'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
    _createdAt: '2022-03-31T17:08:53.747Z',
    _createdBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
    _deprecated: false,
    _incoming:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F98b08a64-f116-46cd-8568-be2aa2849cc4/incoming',
    _outgoing:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F98b08a64-f116-46cd-8568-be2aa2849cc4/outgoing',
    _rev: 149,
    _schemaProject:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
    _self:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F98b08a64-f116-46cd-8568-be2aa2849cc4',
    _updatedAt: '2022-05-25T07:58:25.751Z',
    _updatedBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
  } as unknown) as StudioResource;
  const queryClient = new QueryClient();
  // establish API mocking before all tests
  beforeAll(() => server.listen());
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers());
  // clean up once the tests are done
  afterAll(() => server.close());
  server.use(
    rest.get(
      'https://localhost:3000/resources/org/project/_/w1',
      (req, res, ctx) => {
        const mockResponse = {
          '@context': [
            'https://bluebrain.github.io/nexus/contexts/metadata.json',
            'https://bluebrainnexus.io/studio/context',
          ],
          '@id': 'w1',
          '@type': 'StudioWorkSpace',
          description: `A test work space`,
          label: `w1`,
          dashboards: [
            {
              dashboard: 'd1',
            },
          ],
        };
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponse)
        );
      }
    )
  );

  server.use(
    rest.get(
      'https://localhost:3000/resources/org/project/_/d1',
      (req, res, ctx) => {
        const mockResponse = {
          '@context': [
            'https://bluebrain.github.io/nexus/contexts/metadata.json',
            'https://bluebrainnexus.io/studio/context',
          ],
          '@id': 'd1',
          '@type': 'StudioDashboard',
          description: `A test dashboard`,
          label: `d1`,
          dataTable: {
            '@id': 'dataTable1',
          },
        };
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponse)
        );
      }
    )
  );
  server.use(
    rest.get(
      'https://localhost:3000/resources/org/project/_/dataTable1',
      (req, res, ctx) => {
        const mockResponse = {
          '@context': [
            'https://bluebrain.github.io/nexus/contexts/metadata.json',
            'https://bluebrainnexus.io/studio/context',
          ],
          '@id': 'dataTable1',
          '@type': 'FusionTable',
          description: `A test dataTable`,
          label: `dataTable1`,
          configuration: [
            {
              '@type': 'text',
              enableFilter: false,
              enableSearch: false,
              enableSort: false,
              format: '',
              name: 'o',
            },
            {
              '@type': 'text',
              enableFilter: false,
              enableSearch: false,
              enableSort: false,
              format: '',
              name: 'p',
            },
          ],
          dataQuery:
            'SELECT DISTINCT ?self ?p ?o \nWHERE {\n     ?self ?p ?o .\n}\nLIMIT 10',
          enableDownload: true,
          enableInteractiveRows: true,
          enableSave: true,
          enableSearch: true,
          name: 'Example',
          resultsPerPage: 5,
          view:
            'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
        };
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponse)
        );
      }
    )
  );
  it('renders with a single workspace and dashboard ', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudioReactContext.Provider value={contextValue}>
                  <WorkSpaceMenu
                    workspaceIds={['w1']}
                    studioResource={resource}
                    onListUpdate={jest.fn}
                  ></WorkSpaceMenu>
                </StudioReactContext.Provider>
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
      await waitFor(async () => {
        const dashboardText = await screen.getAllByText('Example');
        expect(dashboardText.length).toBe(1);
        const text = await screen.getAllByText(
          'https://bluebrain.github.io/nexus/vocabulary/apiMappings'
        );
        expect(text.length).toBe(5);
      });
      expect(container).toMatchSnapshot();
    });
  });
  it('shows edit buttons for a user with  edit access', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudioReactContext.Provider value={contextValue}>
                  <WorkSpaceMenu
                    workspaceIds={['w1']}
                    studioResource={resource}
                    onListUpdate={jest.fn}
                  ></WorkSpaceMenu>
                </StudioReactContext.Provider>
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
      await waitFor(async () => {
        const button1 = await screen.getByText('Workspace');
        expect(button1).toBeVisible();
        const button2 = await screen.getByText('Dashboard');
        expect(button2).toBeVisible();
      });
    });
  });
  it('hides edit buttons for a user with out edit access', async () => {
    rest.get('https://localhost:3000/acls/org/project', (req, res, ctx) => {
      const mockResponse = {
        '@context': [
          'https://bluebrain.github.io/nexus/contexts/metadata.json',
          'https://bluebrain.github.io/nexus/contexts/search.json',
          'https://bluebrain.github.io/nexus/contexts/acls.json',
        ],
        _total: 1,
        _results: [
          {
            '@id': 'http://localhost:3000/v1/acls/org1',
            '@type': 'AccessControlList',
            acl: [
              {
                identity: {
                  '@id':
                    'http://localhost:3000/v1/realms/myrealm/groups/a-group',
                  '@type': 'Group',
                  group: 'a-group',
                  realm: 'myrealm',
                },
                permissions: ['projects/read'],
              },
              {
                identity: {
                  '@id':
                    'http://localhost:3000/v1/realms/realm/groups/some-group',
                  '@type': 'Group',
                  group: 'some-group',
                  realm: 'realm',
                },
                permissions: ['projects/read', 'projects/write'],
              },
              {
                identity: {
                  '@id':
                    'http://localhost:3000/v1/realms/local/users/localuser',
                  '@type': 'User',
                  realm: 'local',
                  subject: 'localuser',
                },
                permissions: ['resources/read'], // No write permission.
              },
            ],
            _constrainedBy:
              'https://bluebrain.github.io/nexus/schemas/acls.json',
            _createdAt: '2021-05-11T11:03:06.071Z',
            _createdBy: 'http://localhost:3000/v1/anonymous',
            _deprecated: false,
            _path: '/org/project',
            _rev: 1,
            _self: 'http://localhost:3000/v1/acls/org1',
            _updatedAt: '2021-05-11T11:03:06.071Z',
            _updatedBy: 'http://localhost:3000/v1/anonymous',
          },
        ],
      };
      return res(
        // Respond with a 200 status code
        ctx.status(200),
        ctx.json(mockResponse)
      );
    }),
      await act(async () => {
        const { container } = await render(
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <NexusProvider nexusClient={nexus}>
                <QueryClientProvider client={queryClient}>
                  <StudioReactContext.Provider value={contextValue}>
                    <WorkSpaceMenu
                      workspaceIds={['w1']}
                      studioResource={resource}
                      onListUpdate={jest.fn}
                    ></WorkSpaceMenu>
                  </StudioReactContext.Provider>
                </QueryClientProvider>
              </NexusProvider>
            </ConnectedRouter>
          </Provider>
        );
        await waitFor(async () => {
          // wait for the workspace to load.
          await screen.getAllByText('No dashboards available');
          const buttons = screen.getAllByRole('button');
          expect(buttons).toHaveLength(1);
        });
      });
  });
  it('it displays workspace action on clicking  workspace action button', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudioReactContext.Provider value={contextValue}>
                  <WorkSpaceMenu
                    workspaceIds={['w1']}
                    studioResource={resource}
                    onListUpdate={jest.fn}
                  ></WorkSpaceMenu>
                </StudioReactContext.Provider>
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
      await waitFor(async () => {
        const button1 = await screen.findByText('Workspace');
        expect(button1).toBeVisible();
        const button2 = await screen.findByText('Dashboard');
        expect(button2).toBeVisible();
        const x = await fireEvent.click(button1);
      });
      await waitFor(async () => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Add')).toBeInTheDocument();
        expect(screen.getByText('Remove')).toBeInTheDocument();
      });
    });
  });
  it('it displays workspace add form on clicking add workspace button', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudioReactContext.Provider value={contextValue}>
                  <WorkSpaceMenu
                    workspaceIds={['w1']}
                    studioResource={resource}
                    onListUpdate={jest.fn}
                  ></WorkSpaceMenu>
                </StudioReactContext.Provider>
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });

    await waitFor(async () => {
      await screen.findByText('Workspace');
    });
    await act(async () => {
      const workSpaceAction = await screen.findByText('Workspace');
      fireEvent.click(workSpaceAction);
    });
    await waitFor(async () => {
      await screen.findByText('Add');
    });
    const editButton = await screen.findByText('Add');
    // expect(editButton).toBeVisible();
    await act(async () => {
      await fireEvent.click(editButton);
    });
    await waitFor(async () => {
      const editForm = await screen.findAllByText('Create a new Workspace');
      expect(editForm).toHaveLength(1);
    });
  });
  it('it displays workspace remove confirmation  on clicking remove workspace button', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudioReactContext.Provider value={contextValue}>
                  <WorkSpaceMenu
                    workspaceIds={['w1']}
                    studioResource={resource}
                    onListUpdate={jest.fn}
                  ></WorkSpaceMenu>
                </StudioReactContext.Provider>
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });

    await waitFor(async () => {
      const workSpaceAction = await screen.findByText('Workspace');
      fireEvent.click(workSpaceAction);
    });
    await act(async () => {
      const workSpaceAction = await screen.findByText('Workspace');
      fireEvent.click(workSpaceAction);
    });
    const editButton = await screen.findByText('Remove');
    expect(editButton).toBeVisible();
    await act(async () => {
      await fireEvent.click(editButton);
    });
    await waitFor(async () => {
      const editForm = await screen.findAllByText('Delete Workspace');
      expect(editForm).toHaveLength(1);
    });
  });
  it('it displays workspace edit form on clicking edit workspace button', async () => {
    const { container } = await render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <NexusProvider nexusClient={nexus}>
            <QueryClientProvider client={queryClient}>
              <StudioReactContext.Provider value={contextValue}>
                <WorkSpaceMenu
                  workspaceIds={['w1']}
                  studioResource={resource}
                  onListUpdate={jest.fn}
                ></WorkSpaceMenu>
              </StudioReactContext.Provider>
            </QueryClientProvider>
          </NexusProvider>
        </ConnectedRouter>
      </Provider>
    );

    await waitFor(async () => {
      const workSpaceAction = await screen.findByText('Workspace');
      fireEvent.click(workSpaceAction);
    });
    await act(async () => {
      const workSpaceAction = await screen.findByText('Workspace');
      fireEvent.click(workSpaceAction);
    });
    const editButton = await screen.findByText('Edit');
    expect(editButton).toBeVisible();
    await act(async () => {
      await fireEvent.click(editButton);
      await waitFor(async () => {
        const editForm = await screen.findAllByText('Edit');
        expect(editForm).toHaveLength(1);
      });
    });
  });

  it('it displays dashboard edit/add/remove options on clicking dahsboard edit action', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudioReactContext.Provider value={contextValue}>
                  <WorkSpaceMenu
                    workspaceIds={['w1']}
                    studioResource={resource}
                    onListUpdate={jest.fn}
                  ></WorkSpaceMenu>
                </StudioReactContext.Provider>
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });

    await waitFor(async () => {
      const dashboardAction = await screen.findByText('Dashboard');
      await fireEvent.click(dashboardAction);
    });

    await act(async () => {
      const add = await screen.findAllByText('Add');
      expect(add).toHaveLength(1);
    });
  });

  it('it displays dashboard add form when clicked on add button', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <QueryClientProvider client={queryClient}>
                <StudioReactContext.Provider value={contextValue}>
                  <WorkSpaceMenu
                    workspaceIds={['w1']}
                    studioResource={resource}
                    onListUpdate={jest.fn}
                  ></WorkSpaceMenu>
                </StudioReactContext.Provider>
              </QueryClientProvider>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });

    await act(async () => {
      const dashboardAction = await screen.findByText('Dashboard');
      await fireEvent.click(dashboardAction);
    });

    await act(async () => {
      const add = await screen.findAllByText('Add');
      expect(add).toHaveLength(1);
      await fireEvent.click(add[0]);
    });

    await waitFor(async () => {
      const dbForm = await screen.findByText('Create Dashboard');
      expect(dbForm).toBeVisible();
    });
  });
});
