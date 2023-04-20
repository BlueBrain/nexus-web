import React from 'react';
import { Route, MemoryRouter } from 'react-router';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import StudioAdminView from '../StudioAdminView';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';

import configureStore from '../../../../shared/store';
import fetch from 'node-fetch';
import { render, screen, server } from '../../../../utils/testUtil';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { deltaPath } from '__mocks__/handlers/handlers';

describe('StudioAdminView', () => {
  const queryClient = new QueryClient();
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
    uri: deltaPath(),
  });
  const store = configureStore(history, { nexus }, {});
  it('renders studios in a list', async () => {
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/studios/org/project/studios']}>
            <Route path="/studios/:orgLabel/:projectLabel/studios">
              <QueryClientProvider client={queryClient}>
                <NexusProvider nexusClient={nexus}>
                  <StudioAdminView />
                </NexusProvider>
              </QueryClientProvider>
            </Route>
          </MemoryRouter>
        </Provider>
      );
      expect(container).toMatchSnapshot();
    });
  });
  it('displays links to project and org', async () => {
    await act(async () => {
      await render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/studios/org/project/studios']}>
            <Route path="/studios/:orgLabel/:projectLabel/studios">
              <QueryClientProvider client={queryClient}>
                <NexusProvider nexusClient={nexus}>
                  <StudioAdminView />
                </NexusProvider>
              </QueryClientProvider>
            </Route>
          </MemoryRouter>
        </Provider>
      );
    });
    await act(async () => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/orgs/org');
      expect(links[1]).toHaveAttribute('href', '/orgs/org/project');
    });
  });
});
