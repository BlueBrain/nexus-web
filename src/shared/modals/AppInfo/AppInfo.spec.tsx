import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import configureStore from 'redux-mock-store';
import { act, render, screen, server, waitFor } from '../../../utils/testUtil';
import AppInfo, { EnvironmentInfo } from './AppInfo';
import { vi } from 'vitest';

vi.stubEnv('FUSION_VERSION', '1.0.0');

describe('AppInfo', () => {
  beforeAll(async () => {
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  const mockStore = configureStore();
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
    modals: {
      isCreateOrganizationModelVisible: false,
      isCreateProjectModelVisible: false,
      isCreateStudioModelVisible: false,
      isAboutModelVisible: true,
    },
  };
  const nexusEcosystem = {
    '@context': 'https://bluebrain.github.io/nexus/contexts/version.json',
    delta: '1.0.0',
    dependencies: {
      blazegraph: '2.1.6-SNAPSHOT',
      elasticsearch: '7.17.1',
      postgres: '15.2',
      remoteStorage: '1.5.1',
    },
    environment: 'unit-test',
    plugins: {
      archive: '1.8.0-M7',
      blazegraph: '1.8.0-M7',
      'composite-views': '1.8.0-M7',
      elasticsearch: '1.8.0-M7',
      'graph-analytics': '1.8.0-M7',
      jira: '1.8.0-M7',
      search: '1.8.0-M7',
      storage: '1.8.0-M7',
    },
  };
  const store = mockStore(mockState);
  const App: React.FC = () => (
    <Provider store={store}>
      <NexusProvider nexusClient={nexus}>
        <AppInfo {...{ ...nexusEcosystem }} />
      </NexusProvider>
    </Provider>
  );

  it('shows nexus environment information', async () => {
    console.log('@@env', process.env)
    await act(async () => {
      await render(<App />);
    });
    const fusionVersion = await screen.findByTestId('fusion-version');
    expect(fusionVersion.textContent).toContain(MOCK_ENVIRONMENT.fusionVersion);

    const deltaVersion = await waitFor(() => {
      return screen.findByTestId('delta-version');
    });
    expect(deltaVersion.textContent).toContain(MOCK_ENVIRONMENT.deltaVersion);

    const environmentName = await waitFor(() => {
      return screen.getByText(content =>
        content.includes(MOCK_ENVIRONMENT.environmentName)
      );
    });
    expect(environmentName).toBeDefined();
  });
});

const MOCK_ENVIRONMENT: EnvironmentInfo = {
  deltaVersion: '1.0.0',
  fusionVersion: '1.0.0',
  environmentName: 'unit-test',
  browser: 'FireFox',
  operatingSystem: 'Ubuntu 18',
};
