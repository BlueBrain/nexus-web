import '@testing-library/jest-dom';
import * as React from 'react';
import fetch from 'node-fetch';
import { rest } from 'msw';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, server, screen, waitFor} from '../../utils/testUtil';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Route, MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from '../../shared/hooks/useNotification';
import ProjectPage from './ProjectPage';

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

  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  });

  const mockState = {
    config: {
      apiEndpoint: 'https://localhost:3000',
      analysisPluginSparqlDataQuery: 'detailedCircuit',
      jiraUrl: 'https://bbpteam.epfl.ch/project/devissues',
      httpHeaderForInaccessibleDueToVPN: 'x-requires-vpn',
    },
    auth: {
      identities: [{}],
    },
    oidc: {
      isLoadingUser: false,
      user: {
        id_token:
          'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ckRHNk10dDhwcDJNMm9odWNtakU3WC1TOGhUNzg1am5nMnZncE0wU1AwIn0.eyJleHAiOjE2NTc2MjQ4NzAsImlhdCI6MTY1NzYyMzA3MCwiYXV0aF90aW1lIjoxNjU3NjIzMDY4LCJqdGkiOiIyZWI3MDg1OC1kOWI0LTQ2N2ItYWRjMy05YWJkYzJiYmUyODQiLCJpc3MiOiJodHRwczovL2Rldi5uaXNlLmJicC5lcGZsLmNoL2F1dGgvcmVhbG1zL2xvY2FsIiwiYXVkIjoiYmJwLW5pc2UtZGV2LW5leHVzLWZ1c2lvbiIsInN1YiI6IjAxNmI3OTIzLWE3NDYtNDE5MS1hMDA4LTY0ZDU0M2MzZGYxNiIsInR5cCI6IklEIiwiYXpwIjoiYmJwLW5pc2UtZGV2LW5leHVzLWZ1c2lvbiIsIm5vbmNlIjoiM2E0MmE3YWU2MGQwNDM0OThiM2RiMTBhYjcxZGY3OTAiLCJzZXNzaW9uX3N0YXRlIjoiOTg4NDUwZTAtZjNjMS00NTRhLTgxMTktNzNlNzg0ZWZlYTFkIiwiYXRfaGFzaCI6IjZUVjJ5MzNtcXFaU3JGYklUNldHRVEiLCJhY3IiOiIwIiwic19oYXNoIjoiQjlHTEJkZ1FXQURUaGtZY1ZfQi1NZyIsInNpZCI6Ijk4ODQ1MGUwLWYzYzEtNDU0YS04MTE5LTczZTc4NGVmZWExZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkxvY2FsIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJsb2NhbHVzZXIiLCJnaXZlbl9uYW1lIjoiTG9jYWwiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJlbWFpbCI6Im5vcmVwbHlAZXBmbC5jaCJ9.ZM4Fdvr3WFV4P06xmbwva9MOMoAx97E19MfxkuJy5KXTW_YBwOKC1OI6gDDoUtC_Ybzm7A67SNBAGxHO1ct2qGw4B9KV5uw6hFjasygUx3dGdFkhe4IkLZ0D_0G46j5QlCq72cfk41deXZZesbA7VsqWm2pWlWNTXMr_QXicUPJCUCUFwNS6j3dYd83uPv5IB05-hTTO_7ug1j5v4u-LBGrZ-mxVa9Hv9f79NETCaajNTGYukkTviaEgDsYRH1eMZIXLsR-GpGE910sZkkGHOpA_Wx376tH0iIaageXDzQMtkNbKUMDMmWaNLXC0PMmG9n4Mb6A0FqoJhaoEJk0atg',
        session_state: '988450e0-f3c1-454a-8119-73e784efea1d',
        access_token:
          'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ckRHNk10dDhwcDJNMm9odWNtakU3WC1TOGhUNzg1am5nMnZncE0wU1AwIn0.eyJleHAiOjE2NTc2MjQ4NzAsImlhdCI6MTY1NzYyMzA3MCwiYXV0aF90aW1lIjoxNjU3NjIzMDY4LCJqdGkiOiIwMWJmODFkYy0zMjcxLTRkMjYtOTdhNy03YTVkZmU0MTk2OTAiLCJpc3MiOiJodHRwczovL2Rldi5uaXNlLmJicC5lcGZsLmNoL2F1dGgvcmVhbG1zL2xvY2FsIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjAxNmI3OTIzLWE3NDYtNDE5MS1hMDA4LTY0ZDU0M2MzZGYxNiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImJicC1uaXNlLWRldi1uZXh1cy1mdXNpb24iLCJub25jZSI6IjNhNDJhN2FlNjBkMDQzNDk4YjNkYjEwYWI3MWRmNzkwIiwic2Vzc2lvbl9zdGF0ZSI6Ijk4ODQ1MGUwLWYzYzEtNDU0YS04MTE5LTczZTc4NGVmZWExZCIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiIsImh0dHBzOi8vZGV2Lm5pc2UuYmJwLmVwZmwuY2giLCJodHRwOi8vbG9jYWxob3N0OjgwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWxvY2FsIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6Ijk4ODQ1MGUwLWYzYzEtNDU0YS04MTE5LTczZTc4NGVmZWExZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkxvY2FsIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJsb2NhbHVzZXIiLCJnaXZlbl9uYW1lIjoiTG9jYWwiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJlbWFpbCI6Im5vcmVwbHlAZXBmbC5jaCJ9.iWS5e3CbwtL3bXEj3XXPaYlX0pTfealA08xGtJopfoN9cBfJT-x2D0OamQNV-l6olbwsjrjNgCTfO1o0IPGVZhh3g55YSw-PQQh3NUCY58nwY1RrEXyMx0nIbaZJitv2cKelI0aOkA99GJ0R8adMCFwQki2X1gt93sLab84YDOnFsP7UbKT7jlBeWBub4yGai7cfLcx-AahEREUb5P-HTFfoKLbGJ33AawYs6XFoWlIk8mXxPukcpK8dSAKFa5r0-6hGEAowsico4xawsazTXz0YSbxFovBB79uzU7wVeB50NR2saVLtVhBZON2IPW2xBBNiOFhuYTeaN8uq3hp8tQ',
        token_type: 'Bearer',
        scope: 'openid',
        profile: {
          auth_time: 1657623068,
          jti: '2eb70858-d9b4-467b-adc3-9abdc2bbe284',
          sub: '016b7923-a746-4191-a008-64d543c3df16',
          typ: 'ID',
          azp: 'bbp-nise-dev-nexus-fusion',
          session_state: '988450e0-f3c1-454a-8119-73e784efea1d',
          acr: '0',
          s_hash: 'B9GLBdgQWADThkYcV_B-Mg',
          sid: '988450e0-f3c1-454a-8119-73e784efea1d',
          email_verified: false,
          name: 'Local User',
          preferred_username: 'localuser',
          given_name: 'Local',
          family_name: 'User',
          email: 'noreply@epfl.ch',
        },
        expires_at: 1657624870,
      },
    },
  };
  const queryClient = new QueryClient();
  const mockStore = configureStore();
  jest.mock('react-redux', () => {
    const ActualReactRedux = jest.requireActual('react-redux');
    return {
      ...ActualReactRedux,
      useSelector: jest.fn().mockImplementation(() => {
        return mockState;
      }),
    };
  });

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

    const store = mockStore(mockState);
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

    const store = mockStore(mockState);
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
