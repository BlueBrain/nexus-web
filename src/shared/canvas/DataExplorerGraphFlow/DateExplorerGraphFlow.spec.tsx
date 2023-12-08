import '@testing-library/jest-dom';

import { deltaPath } from '__mocks__/handlers/handlers';
import { createNexusClient, NexusClient } from '@bbp/nexus-sdk/es';
import { NexusProvider } from '@bbp/react-nexus';
import { act, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { createMemoryHistory, MemoryHistory } from 'history';
import { setupServer } from 'msw/node';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { AnyAction, Store } from 'redux';

import {
  getDataExplorerGraphFlowResourceObject,
  getDataExplorerGraphFlowResourceObjectTags,
  getDataExplorerGraphFlowResourceSource,
  initialResource,
} from '../../../__mocks__/handlers/DataExplorerGraphFlow/handlers';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  InitNewVisitDataExplorerGraphView,
  TDataExplorerState,
} from '../../../shared/store/reducers/data-explorer';
import { getResourceLabel } from '../../../shared/utils';
import { configureStore } from '../../../store';
import { cleanup, render, screen } from '../../../utils/testUtil';
import DateExplorerGraphFlow from './DateExplorerGraphFlow';

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
    const queryClient = new QueryClient();

    nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    store = configureStore(history, { nexus }, {});
    app = (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>
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

  it('should render the name of the resource', async () => {
    store.dispatch(
      InitNewVisitDataExplorerGraphView({
        current: initialDataExplorerState.current,
        fullscreen: false,
      })
    );
    rerender(app);
    const resourceTitle = await waitFor(() => screen.getByText(initialResource.name));
    expect(resourceTitle.innerHTML).toEqual(initialResource.name);
    expect(resourceTitle).toBeInTheDocument();
  });
  it('should clean the data explorer state when quit the page', async () => {
    store.dispatch(
      InitNewVisitDataExplorerGraphView({
        current: initialDataExplorerState.current,
        fullscreen: false,
      })
    );
    rerender(app);
    history.push('/another-page');
    const dataExplorerState = store.getState().dataExplorer;
    const sessionStorageItem = sessionStorage.getItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
    expect(sessionStorageItem).toBeNull();
    expect(dataExplorerState.leftNodes.links.length).toBe(0);
    expect(dataExplorerState.rightNodes.links.length).toBe(0);
    expect(dataExplorerState.current).toBeNull();
    expect(dataExplorerState.fullscreen).toBe(false);
  });

  it('should the fullscren toggle present in the screen if the user in fullscreen mode', async () => {
    store.dispatch(
      InitNewVisitDataExplorerGraphView({
        current: initialDataExplorerState.current,
        fullscreen: true,
      })
    );

    rerender(app);

    const fullscreenSwitch = container.querySelector('button[aria-label="fullscreen switch"]');

    const fullscreenTitle = container.querySelector('h1[aria-label="fullscreen title"]');

    expect(fullscreenSwitch).toBeInTheDocument();

    expect(fullscreenTitle).toBeInTheDocument();

    await act(async () => {
      await user.click(fullscreenSwitch as HTMLButtonElement);
    });

    waitFor(() => expect(store.getState().dataExplorer.fullscreen).toBe(false));
  });
});
