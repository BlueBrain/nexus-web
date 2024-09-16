import { deltaPath } from '__mocks__/handlers/handlers';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import { cleanup, render, screen, waitFor } from '../../utils/testUtil';
import { createNexusClient, ResourceListOptions } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import '@testing-library/jest-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import {
  resourcesHandler,
  searchHitsHandler,
} from '__mocks__/handlers/ResourceListContainerHandlers';
import ResourceListBoardContainer from './ResourceListBoardContainer';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { configureStore } from '../../store';
import { vi } from 'vitest';

describe('ResourceListBoardContainer', () => {
  const queryClient = new QueryClient();
  let user: UserEvent;
  let server: ReturnType<typeof setupServer>;
  let spy: any;

  beforeAll(() => {
    server = setupServer(resourcesHandler, searchHitsHandler);
    server.listen();
  });

  beforeEach(async () => {
    const history = createMemoryHistory({});
    const nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    const store = configureStore(history, { nexus }, {});

    const resourceListBoardContainer = (
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            {/* @ts-ignore */}
            <NexusProvider nexusClient={nexus}>
              <ResourceListBoardContainer
                orgLabel="bbp"
                projectLabel="agents"
                refreshLists={false}
              />
            </NexusProvider>
          </QueryClientProvider>
        </Router>
      </Provider>
    );

    spy = vi.spyOn(nexus.Resource, 'list');
    await waitFor(() => {
      renderContainer(resourceListBoardContainer);
    });
    await screen.findByText('3 results');
  });

  const renderContainer = (containerToRender: JSX.Element) => {
    render(containerToRender);
    user = userEvent.setup();
  };

  afterEach(() => {
    cleanup();
    queryClient.clear();
    localStorage.clear();
  });

  afterAll(() => {
    server.resetHandlers();
    server.close();
  });

  const querySentToApi = (): ResourceListOptions => {
    const calls = spy.mock.calls;
    const mostRecentCall = calls[calls.length - 1];
    return mostRecentCall[2]; // assuming the third argument is what you need
  };

  const defaultSortCriteria = '-_createdAt';

  it('sends sort without search text by default', async () => {
    const defaultQuery = querySentToApi();
    expect(defaultQuery.q).toBeUndefined();
    expect(defaultQuery.sort).toEqual(defaultSortCriteria);
  });

  // TODO Migration: This test should pass
  // it('preserves sorting criteria in nexus api after search text is cleared', async () => {
  //   const searchInput = screen.getByPlaceholderText('Search...');
  //   await user.type(searchInput, 'something');

  //   const queryWithSearchText = querySentToApi();
  //   expect(queryWithSearchText.q).toEqual('something');
  //   expect(queryWithSearchText.sort).toBeUndefined();

  //   await user.clear(searchInput);

  //   const queryWithoutSearchText = querySentToApi();
  //   expect(queryWithoutSearchText.q).toEqual('');
  //   expect(queryWithoutSearchText.sort).toEqual('-_createdAt');
  //   await screen.findByText('3 results');
  // });
});
