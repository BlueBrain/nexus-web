import '@testing-library/jest-dom';
import userEvent, { UserEvent } from '@testing-library/user-event';
import React from 'react';
import { RenderResult, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { NexusClient, createNexusClient } from '@bbp/nexus-sdk/es';
import { AnyAction, Store } from 'redux';
import { NexusProvider } from '@bbp/react-nexus';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { deltaPath } from '__mocks__/handlers/handlers';
import { cleanup, render, screen } from '../../../utils/testUtil';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  InitNewVisitDataExplorerGraphView,
  TDataExplorerState,
} from '../../../shared/store/reducers/data-explorer';
import DateExplorerGraphFlow from './DateExplorerGraphFlow';
import {
  initialResource,
  getDataExplorerGraphFlowResourceObject,
  getDataExplorerGraphFlowResourceObjectTags,
  getDataExplorerGraphFlowResourceSource,
} from '../../../__mocks__/handlers/DataExplorerGraphFlow/handlers';
import { configureStore } from '../../../store';
import { QueryClient, QueryClientProvider } from 'react-query';

const initialDataExplorerState: TDataExplorerState = {
  current: {
    isDownloadable: false,
    _self: initialResource._self,
    title: initialResource.name,
    types: initialResource['@type'],
    resource: ['public', 'sscx', initialResource['@id'], initialResource._rev],
  },
  leftNodes: { links: [], shrinked: false },
  rightNodes: { links: [], shrinked: false },
  fullscreen: false,
};

describe('DataExplorerGraphFlow', () => {
  let server: ReturnType<typeof setupServer>;
  let app: JSX.Element;
  let container: HTMLElement;
  let rerender: (ui: React.ReactElement) => void;
  let store: Store<any, AnyAction>;
  let user: UserEvent;
  let history: MemoryHistory<{}>;
  let nexus: NexusClient;
  let component: RenderResult;

  beforeAll(async () => {
    nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    server = setupServer(
      getDataExplorerGraphFlowResourceObject,
      getDataExplorerGraphFlowResourceObjectTags,
      getDataExplorerGraphFlowResourceSource
    );

    server.listen();
    history = createMemoryHistory({});
    store = configureStore(
      history,
      { nexus },
      {
        router: {
          location: {
            pathname: '/',
            search: '',
            hash: '',
            state: {},
            key: 'cvvg7m',
            query: {},
          },
          action: 'POP',
        },
      }
    );
  });

  afterAll(() => {
    server.resetHandlers();
    server.close();
    localStorage.clear();
    cleanup();
  });

  beforeEach(() => {
    history = createMemoryHistory({});

    nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    const queryClient = new QueryClient();
    store = configureStore(history, { nexus }, {});
    app = (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>
            {/* @ts-ignore */}
            <NexusProvider nexusClient={nexus}>
              <DateExplorerGraphFlow />
            </NexusProvider>
          </Router>
        </QueryClientProvider>
      </Provider>
    );
    component = render(app);
    container = component.container;
    rerender = component.rerender;
    user = userEvent.setup();
  });

  // TODO Migration this test should pass
  // it('should render the name of the resource', async () => {
  //   await act(async () => {
  //     store.dispatch(
  //       InitNewVisitDataExplorerGraphView({
  //         current: initialDataExplorerState.current,
  //         fullscreen: false,
  //       })
  //     );
  //   });
  //   rerender(app);
  //   const resourceTitle = await waitFor(() =>
  //     screen.getByText(initialResource.name)
  //   );
  //   expect(resourceTitle.innerHTML).toEqual(initialResource.name);
  //   expect(resourceTitle).toBeInTheDocument();
  // });

  it('should clean the data explorer state when quit the page', async () => {
    await act(async () => {
      store.dispatch(
        InitNewVisitDataExplorerGraphView({
          current: initialDataExplorerState.current,
          fullscreen: false,
        })
      );
      rerender(app);
      history.push('/another-page');
    });
    const dataExplorerState = store.getState().dataExplorer;
    const sessionStorageItem = sessionStorage.getItem(
      DATA_EXPLORER_GRAPH_FLOW_DIGEST
    );
    expect(sessionStorageItem).toBeNull();
    expect(dataExplorerState.leftNodes.links.length).toBe(0);
    expect(dataExplorerState.rightNodes.links.length).toBe(0);
    expect(dataExplorerState.current).toBeNull();
    expect(dataExplorerState.fullscreen).toBe(false);
  });

  // TODO Migration this test should pass
  // it('should the fullscreen toggle present in the screen if the user in fullscreen mode', async () => {
  //   await act(async () => {
  //     store.dispatch(
  //       InitNewVisitDataExplorerGraphView({
  //         current: initialDataExplorerState.current,
  //         fullscreen: true,
  //       })
  //     );
  //     rerender(app);

  //     const fullscreenSwitch = container.querySelector(
  //       'button[aria-label="fullscreen switch"]'
  //     );

  //     const fullscreenTitle = container.querySelector(
  //       'h1[aria-label="fullscreen title"]'
  //     );

  //     expect(fullscreenSwitch).toBeInTheDocument();

  //     expect(fullscreenTitle).toBeInTheDocument();

  //     await act(async () => {
  //       await user.click(fullscreenSwitch as HTMLButtonElement);
  //     });
  //   });

  //   await waitFor(() =>
  //     expect(store.getState().dataExplorer.fullscreen).toBe(false)
  //   );
  // });
});
