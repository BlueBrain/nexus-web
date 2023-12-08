import '@testing-library/jest-dom';

import { deltaPath } from '__mocks__/handlers/handlers';
import { createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import { createBrowserHistory } from 'history';
import fetch from 'node-fetch';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouter,Route } from 'react-router';

import { configureStore } from '../../../../store';
import { render, screen, server } from '../../../../utils/testUtil';
import StudioAdminView from '../StudioAdminView';

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
