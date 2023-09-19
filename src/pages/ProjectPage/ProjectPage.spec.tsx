import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as React from 'react';
import fetch from 'node-fetch';
import { rest } from 'msw';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, server, screen, waitFor } from '../../utils/testUtil';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Route, MemoryRouter } from 'react-router-dom';
import { configureStore } from '../../store';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from '../../shared/hooks/useNotification';
import ProjectPage from './ProjectPage';
import { createMemoryHistory } from 'history';

describe('ProjectPage', () => {
  // establish API mocking before all tests
  beforeAll(() => {
    server.listen();
  });
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers());
  // clean up once the tests are done
  afterAll(() => server.close());

  const queryClient = new QueryClient();

  it('does not include Jira tab when not connected to the VPN due to Jira being inaccessible', async () => {
    server.use(
      rest.get(
        'https://localhost:3000/projects/orgLabel/projectLabel',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json({
              '@context': [
                'https://bluebrain.github.io/nexus/contexts/projects.json',
                'https://bluebrain.github.io/nexus/contexts/metadata.json',
              ],
              '@id':
                'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
              '@type': 'Project',
              apiMappings: [],
              base:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/orgLabel/projectLabel/_/',
              description: '',
              vocab:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/orgLabel/projectLabel/',
              _constrainedBy:
                'https://bluebrain.github.io/nexus/schemas/projects.json',
              _createdAt: '2022-07-12T08:17:21.647Z',
              _createdBy:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
              _deprecated: false,
              _effectiveApiMappings: [
                {
                  _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
                  _prefix: 'nxv',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                  _prefix: 'documents',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
                  _prefix: 'defaultResolver',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
                  _prefix: 'schema',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                  _prefix: 'resource',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                  _prefix: '_',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _prefix: 'view',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/storages.json',
                  _prefix: 'storage',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/files.json',
                  _prefix: 'file',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/resolvers.json',
                  _prefix: 'resolver',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                  _prefix: 'graph',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/archives.json',
                  _prefix: 'archive',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
                  _prefix: 'defaultStorage',
                },
              ],
              _label: 'projectLabel',
              _markedForDeletion: false,
              _organizationLabel: 'orgLabel',
              _organizationUuid: '469d168c-6d17-4020-bbad-0ccef5e1b336',
              _rev: 1,
              _self:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
              _updatedAt: '2022-07-12T08:17:21.647Z',
              _updatedBy:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
              _uuid: '26b3441e-6e88-44d7-9c33-e9db7f3a4629',
            })
          );
        }
      ),
      rest.get(
        'https://localhost:3000/resources/orgLabel/projectLabel',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json({
              '@context': [
                'https://bluebrain.github.io/nexus/contexts/metadata.json',
                'https://bluebrain.github.io/nexus/contexts/search.json',
                'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
              ],
              _total: 6,
              _results: [
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
                  '@type': ['Resolver', 'InProject'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/resolvers.json',
                  _createdAt: '2022-07-12T08:17:22.234Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/resolvers/orgLabel/projectLabel/defaultResolver/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/resolvers/orgLabel/projectLabel/defaultResolver/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/resolvers/orgLabel/projectLabel/defaultResolver',
                  _updatedAt: '2022-07-12T08:17:22.234Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/searchView',
                  '@type': ['View', 'CompositeView'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-07-12T08:17:22.183Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/nxv:searchView/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/nxv:searchView/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/nxv:searchView',
                  _updatedAt: '2022-07-12T08:17:22.183Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _uuid: '9dcda138-7554-441e-99d5-8de200ed6789',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
                  '@type': ['Storage', 'DiskStorage'],
                  _algorithm: 'SHA-256',
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/storages.json',
                  _createdAt: '2022-07-12T08:17:22.160Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/storages/orgLabel/projectLabel/defaultStorage/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/storages/orgLabel/projectLabel/defaultStorage/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/storages/orgLabel/projectLabel/defaultStorage',
                  _updatedAt: '2022-07-12T08:17:22.160Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                  '@type': ['ElasticSearchView', 'View'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-07-12T08:17:22.125Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/documents/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/documents/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/documents',
                  _updatedAt: '2022-07-12T08:17:22.125Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _uuid: '49e1b742-19e3-4e1f-a608-380cb1ba97ed',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                  '@type': ['View', 'SparqlView'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-07-12T08:17:21.811Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/graph/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/graph/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/graph',
                  _updatedAt: '2022-07-12T08:17:21.811Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _uuid: '65e279a3-9c71-4f5e-91b8-95ebbaf992af',
                },
                {
                  '@id':
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  '@type': 'Project',
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/projects.json',
                  _createdAt: '2022-07-12T08:17:21.647Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
                  _deprecated: false,
                  _effectiveApiMappings: [
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                      _prefix: 'resource',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                      _prefix: 'documents',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
                      _prefix: 'schema',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
                      _prefix: 'defaultResolver',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
                      _prefix: 'defaultStorage',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/',
                      _prefix: 'nxv',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/archives.json',
                      _prefix: 'archive',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/views.json',
                      _prefix: 'view',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/resolvers.json',
                      _prefix: 'resolver',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/files.json',
                      _prefix: 'file',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                      _prefix: 'graph',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/storages.json',
                      _prefix: 'storage',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                      _prefix: '_',
                    },
                  ],
                  _label: 'projectLabel',
                  _markedForDeletion: false,
                  _organizationLabel: 'orgLabel',
                  _organizationUuid: '469d168c-6d17-4020-bbad-0ccef5e1b336',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _updatedAt: '2022-07-12T08:17:21.647Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
                  _uuid: '26b3441e-6e88-44d7-9c33-e9db7f3a4629',
                },
              ],
            })
          );
        }
      ),
      rest.get(
        'https://localhost:3000/views/orgLabel/projectLabel/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultElasticSearchIndex/statistics',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json({
              '@context':
                'https://bluebrain.github.io/nexus/contexts/statistics.json',
              '@type': 'ViewStatistics',
              delayInSeconds: 0,
              discardedEvents: 0,
              evaluatedEvents: 6,
              failedEvents: 0,
              lastEventDateTime: '2022-07-12T08:17:22.234Z',
              lastProcessedEventDateTime: '2022-07-12T08:17:22.234Z',
              processedEvents: 6,
              remainingEvents: 0,
              totalEvents: 6,
            })
          );
        }
      ),
      rest.get('https://localhost:3000/version', (req, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json({
            '@context':
              'https://bluebrain.github.io/nexus/contexts/version.json',
            delta: '1.8.0-M2',
            dependencies: {
              blazegraph: '2.1.6-SNAPSHOT',
              cassandra: '3.11.12',
              elasticsearch: '7.17.1',
              remoteStorage: '1.5.1',
            },
            plugins: {
              archive: '1.8.0-M2',
              blazegraph: '1.8.0-M2',
              'composite-views': '1.8.0-M2',
              elasticsearch: '1.8.0-M2',
              'graph-analytics': '1.8.0-M2',
              jira: '1.8.0-M2',
              search: '1.8.0-M2',
              storage: '1.8.0-M2',
            },
          })
        );
      }),
      rest.get('https://localhost:3000/jira/project', (req, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(403),
          ctx.set({ 'x-requires-vpn': 'true', 'Content-Type': 'text/html' }),
          ctx.body('')
        );
      })
    );

    const history = createMemoryHistory({});
    const nexus = createNexusClient({
      fetch,
      uri: 'https://localhost:3000',
    });

    const store = configureStore(history, { nexus }, {
      config: {
        apiEndpoint: 'https://localhost:3000',
        analysisPluginSparqlDataQuery: 'detailedCircuit',
        jiraUrl: 'https://localhost:3000/jira/project/devissues',
        httpHeaderForInaccessibleDueToVPN: true
      },
    });

    const App: React.FC = () => {
      const notificationData: NotificationContextType = getNotificationContextValue();

      return (
        <MemoryRouter initialEntries={['/projects/orgLabel/projectLabel']}>
          <Route path="/projects/:orgLabel/:projectLabel">
            <Provider store={store}>
              <NotificationContext.Provider value={notificationData}>
                <QueryClientProvider client={queryClient}>
                  <NexusProvider nexusClient={nexus}>
                    <ProjectPage />
                  </NexusProvider>
                </QueryClientProvider>
              </NotificationContext.Provider>
            </Provider>
          </Route>
        </MemoryRouter>
      );
    };

    await act(async () => {
      await render(<App />);
    });

    const jiraTab = screen.queryByText(/Jira/);
    expect(jiraTab).not.toBeInTheDocument();
  });

  it('includes the Jira tab when connected to the VPN and Jira is accessible', async () => {
    server.use(
      rest.get(
        'https://localhost:3000/projects/orgLabel/projectLabel',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json({
              '@context': [
                'https://bluebrain.github.io/nexus/contexts/projects.json',
                'https://bluebrain.github.io/nexus/contexts/metadata.json',
              ],
              '@id':
                'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
              '@type': 'Project',
              apiMappings: [],
              base:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/orgLabel/projectLabel/_/',
              description: '',
              vocab:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/vocabs/orgLabel/projectLabel/',
              _constrainedBy:
                'https://bluebrain.github.io/nexus/schemas/projects.json',
              _createdAt: '2022-07-12T08:17:21.647Z',
              _createdBy:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
              _deprecated: false,
              _effectiveApiMappings: [
                {
                  _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
                  _prefix: 'nxv',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                  _prefix: 'documents',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
                  _prefix: 'defaultResolver',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
                  _prefix: 'schema',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                  _prefix: 'resource',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                  _prefix: '_',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _prefix: 'view',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/storages.json',
                  _prefix: 'storage',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/files.json',
                  _prefix: 'file',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/resolvers.json',
                  _prefix: 'resolver',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                  _prefix: 'graph',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/schemas/archives.json',
                  _prefix: 'archive',
                },
                {
                  _namespace:
                    'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
                  _prefix: 'defaultStorage',
                },
              ],
              _label: 'projectLabel',
              _markedForDeletion: false,
              _organizationLabel: 'orgLabel',
              _organizationUuid: '469d168c-6d17-4020-bbad-0ccef5e1b336',
              _rev: 1,
              _self:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
              _updatedAt: '2022-07-12T08:17:21.647Z',
              _updatedBy:
                'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
              _uuid: '26b3441e-6e88-44d7-9c33-e9db7f3a4629',
            })
          );
        }
      ),
      rest.get(
        'https://localhost:3000/resources/orgLabel/projectLabel',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json({
              '@context': [
                'https://bluebrain.github.io/nexus/contexts/metadata.json',
                'https://bluebrain.github.io/nexus/contexts/search.json',
                'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
              ],
              _total: 6,
              _results: [
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
                  '@type': ['Resolver', 'InProject'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/resolvers.json',
                  _createdAt: '2022-07-12T08:17:22.234Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/resolvers/orgLabel/projectLabel/defaultResolver/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/resolvers/orgLabel/projectLabel/defaultResolver/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/resolvers/orgLabel/projectLabel/defaultResolver',
                  _updatedAt: '2022-07-12T08:17:22.234Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/searchView',
                  '@type': ['View', 'CompositeView'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-07-12T08:17:22.183Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/nxv:searchView/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/nxv:searchView/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/nxv:searchView',
                  _updatedAt: '2022-07-12T08:17:22.183Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _uuid: '9dcda138-7554-441e-99d5-8de200ed6789',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
                  '@type': ['Storage', 'DiskStorage'],
                  _algorithm: 'SHA-256',
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/storages.json',
                  _createdAt: '2022-07-12T08:17:22.160Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/storages/orgLabel/projectLabel/defaultStorage/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/storages/orgLabel/projectLabel/defaultStorage/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/storages/orgLabel/projectLabel/defaultStorage',
                  _updatedAt: '2022-07-12T08:17:22.160Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                  '@type': ['ElasticSearchView', 'View'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-07-12T08:17:22.125Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/documents/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/documents/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/documents',
                  _updatedAt: '2022-07-12T08:17:22.125Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _uuid: '49e1b742-19e3-4e1f-a608-380cb1ba97ed',
                },
                {
                  '@id':
                    'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                  '@type': ['View', 'SparqlView'],
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/views.json',
                  _createdAt: '2022-07-12T08:17:21.811Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _deprecated: false,
                  _incoming:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/graph/incoming',
                  _outgoing:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/graph/outgoing',
                  _project:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/views/orgLabel/projectLabel/graph',
                  _updatedAt: '2022-07-12T08:17:21.811Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
                  _uuid: '65e279a3-9c71-4f5e-91b8-95ebbaf992af',
                },
                {
                  '@id':
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  '@type': 'Project',
                  _constrainedBy:
                    'https://bluebrain.github.io/nexus/schemas/projects.json',
                  _createdAt: '2022-07-12T08:17:21.647Z',
                  _createdBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
                  _deprecated: false,
                  _effectiveApiMappings: [
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                      _prefix: 'resource',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
                      _prefix: 'documents',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
                      _prefix: 'schema',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
                      _prefix: 'defaultResolver',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
                      _prefix: 'defaultStorage',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/',
                      _prefix: 'nxv',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/archives.json',
                      _prefix: 'archive',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/views.json',
                      _prefix: 'view',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/resolvers.json',
                      _prefix: 'resolver',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/files.json',
                      _prefix: 'file',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
                      _prefix: 'graph',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/storages.json',
                      _prefix: 'storage',
                    },
                    {
                      _namespace:
                        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
                      _prefix: '_',
                    },
                  ],
                  _label: 'projectLabel',
                  _markedForDeletion: false,
                  _organizationLabel: 'orgLabel',
                  _organizationUuid: '469d168c-6d17-4020-bbad-0ccef5e1b336',
                  _rev: 1,
                  _self:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/orgLabel/projectLabel',
                  _updatedAt: '2022-07-12T08:17:21.647Z',
                  _updatedBy:
                    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/wells',
                  _uuid: '26b3441e-6e88-44d7-9c33-e9db7f3a4629',
                },
              ],
            })
          );
        }
      ),
      rest.get(
        'https://localhost:3000/views/orgLabel/projectLabel/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultElasticSearchIndex/statistics',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json({
              '@context':
                'https://bluebrain.github.io/nexus/contexts/statistics.json',
              '@type': 'ViewStatistics',
              delayInSeconds: 0,
              discardedEvents: 0,
              evaluatedEvents: 6,
              failedEvents: 0,
              lastEventDateTime: '2022-07-12T08:17:22.234Z',
              lastProcessedEventDateTime: '2022-07-12T08:17:22.234Z',
              processedEvents: 6,
              remainingEvents: 0,
              totalEvents: 6,
            })
          );
        }
      ),
      rest.get('https://localhost:3000/version', (req, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json({
            '@context':
              'https://bluebrain.github.io/nexus/contexts/version.json',
            delta: '1.8.0-M2',
            dependencies: {
              blazegraph: '2.1.6-SNAPSHOT',
              cassandra: '3.11.12',
              elasticsearch: '7.17.1',
              remoteStorage: '1.5.1',
            },
            plugins: {
              archive: '1.8.0-M2',
              blazegraph: '1.8.0-M2',
              'composite-views': '1.8.0-M2',
              elasticsearch: '1.8.0-M2',
              'graph-analytics': '1.8.0-M2',
              jira: '1.8.0-M2',
              search: '1.8.0-M2',
              storage: '1.8.0-M2',
            },
          })
        );
      }),
      rest.get('https://localhost:3000/jira/project', (req, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(403),
          ctx.set({ 'Content-Type': 'text/html' }),
          ctx.body('')
        );
      })
    );

    const history = createMemoryHistory({});
    const nexus = createNexusClient({
      fetch,
      uri: 'https://localhost:3000',
    });

    const store = configureStore(history, { nexus }, {
      config: {
        apiEndpoint: 'https://localhost:3000',
        analysisPluginSparqlDataQuery: 'detailedCircuit',
        jiraUrl: 'https://localhost:3000/jira/project/devissues',
      },
    });
    const App: React.FC = () => {
      const notificationData: NotificationContextType = getNotificationContextValue();

      return (
        <MemoryRouter initialEntries={['/projects/orgLabel/projectLabel']}>
          <Route path="/projects/:orgLabel/:projectLabel">
            <Provider store={store}>
              <NotificationContext.Provider value={notificationData}>
                <QueryClientProvider client={queryClient}>
                  <NexusProvider nexusClient={nexus}>
                    <ProjectPage />
                  </NexusProvider>
                </QueryClientProvider>
              </NotificationContext.Provider>
            </Provider>
          </Route>
        </MemoryRouter>
      );
    };

    await act(async () => {
      await render(<App />);
    });

    const jiraTab = await waitFor(() => {
      return screen.findByText(/Jira/i);
    });

    expect(jiraTab).toBeInTheDocument();
  });
});
