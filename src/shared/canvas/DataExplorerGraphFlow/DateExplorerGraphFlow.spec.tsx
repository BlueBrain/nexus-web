import '@testing-library/jest-dom';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { NexusClient, createNexusClient } from '@bbp/nexus-sdk';
import { AnyAction, Store } from 'redux';
import { NexusProvider } from '@bbp/react-nexus';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { deltaPath } from '__mocks__/handlers/handlers';
import { cleanup, render, act, screen } from '../../../utils/testUtil';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  InitNewVisitDataExplorerGraphView,
} from '../../../shared/store/reducers/data-explorer';
import configureStore from '../../store';
import DateExplorerGraphFlow from './DateExplorerGraphFlow';
import {
  initialResource,
  getDataExplorerGraphFlowResourceObject,
  getDataExplorerGraphFlowResourceObjectTags,
} from '../../../__mocks__/handlers/DataExplorerGraphFlow/handlers';

const initialDataExplorerState = {
  current: {
    isDownloadable: false,
    _self: initialResource._self,
    title: initialResource.name,
    types: initialResource['@type'],
    resource: ['public', 'sscx', initialResource['@id'], initialResource._rev],
  },
  links: [],
  shrinked: false,
  highlightIndex: -1,
  limited: false,
};
describe('DataExplorerGraphFlow', () => {
  let store: Store<any, AnyAction>;
  let history: MemoryHistory<{}>;
  let server: ReturnType<typeof setupServer>;
  let nexus: NexusClient;
  beforeAll(async () => {
    nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    server = setupServer(
      getDataExplorerGraphFlowResourceObject,
      getDataExplorerGraphFlowResourceObjectTags
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

  it('should render the name of the resource', async () => {
    const App: JSX.Element = (
      <Provider store={store}>
        <Router history={history}>
          <NexusProvider nexusClient={nexus}>
            <DateExplorerGraphFlow />
          </NexusProvider>
        </Router>
      </Provider>
    );
    await act(async () => {
      await render(App);
    });
    store.dispatch(
      InitNewVisitDataExplorerGraphView({
        current: initialDataExplorerState.current,
        limited: false,
      })
    );

    const resourceTitle = await waitFor(() =>
      screen.getByText(initialResource.name)
    );
    expect(resourceTitle).toBeInTheDocument();
  });
  it('should clean the data explorer state when quit the page', async () => {
    const App: JSX.Element = (
      <Provider store={store}>
        <Router history={history}>
          <NexusProvider nexusClient={nexus}>
            <DateExplorerGraphFlow />
          </NexusProvider>
        </Router>
      </Provider>
    );
    await act(async () => {
      await render(App);
    });
    store.dispatch(
      InitNewVisitDataExplorerGraphView({
        current: initialDataExplorerState.current,
        limited: false,
      })
    );
    history.push('/another-page');
    const dataExplorerState = store.getState().dataExplorer;
    const localstorage = localStorage.getItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
    expect(localstorage).toBeNull();
    expect(dataExplorerState.links.length).toBe(0);
    expect(dataExplorerState.current).toBeNull();
    expect(dataExplorerState.shrinked).toBe(false);
    expect(dataExplorerState.limited).toBe(false);
    expect(dataExplorerState.highlightIndex).toBe(-1);
  });
});
