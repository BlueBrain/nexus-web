import '@testing-library/jest-dom';
import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { AnyAction, Store } from 'redux';
import { Provider } from 'react-redux';
import { createMemoryHistory, MemoryHistory } from 'history';
import { createNexusClient, NexusClient } from '@bbp/nexus-sdk';
import { Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { NexusProvider } from '@bbp/react-nexus';
import { waitFor } from '../../../utils/testUtil';
import { deltaPath } from '../../../__mocks__/handlers/handlers';
import NavigationStack from './NavigationStack';
import {
  NavigationBack,
  NavigationCollapseButton,
} from '../../molecules/DataExplorerGraphFlowMolecules';
import configureStore from '../../store';
import {
  ReturnBackDataExplorerGraphFlow,
  AddNewNodeDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
  PopulateDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';

const sampleDigest =
  'eyJjdXJyZW50Ijp7Il9zZWxmIjoiaHR0cHM6Ly9iYnAuZXBmbC5jaC9uZXh1cy92MS9yZXNvdXJjZXMvYmJwL2F0bGFzL2RhdGFzaGFwZXM6dm9sdW1ldHJpY2RhdGFsYXllci9jY2UwNmU5Ni04NWE0LTQwM2QtOGI4Ny02MzRhMTU1NGNkYjkiLCJ0aXRsZSI6IkJCUCBNb3VzZSBCcmFpbiBUZW1wbGF0ZSBWb2x1bWUsIDI1bSIsInR5cGVzIjpbIlZvbHVtZXRyaWNEYXRhTGF5ZXIiLCJCcmFpblRlbXBsYXRlRGF0YUxheWVyIiwiRGF0YXNldCJdLCJyZXNvdXJjZSI6WyJiYnAiLCJhdGxhcyIsImh0dHBzOi8vYmJwLmVwZmwuY2gvbmV1cm9zY2llbmNlZ3JhcGgvZGF0YS9jY2UwNmU5Ni04NWE0LTQwM2QtOGI4Ny02MzRhMTU1NGNkYjkiLDJdfSwibGlua3MiOlt7Il9zZWxmIjoiaHR0cHM6Ly9iYnAuZXBmbC5jaC9uZXh1cy92MS9yZXNvdXJjZXMvYmJwL2xubWNlL2RhdGFzaGFwZXM6ZGF0YXNldC90cmFjZXMlMkY0NjBiZmEyZS1jYjdkLTQ0MjAtYTQ0OC0yMDMwYTZiZjRhZTQiLCJ0aXRsZSI6IjAwMV8xNDEyMTZfQTFfQ0ExcHlfUl9NUEciLCJ0eXBlcyI6WyJFbnRpdHkiLCJUcmFjZSIsIkRhdGFzZXQiXSwicmVzb3VyY2UiOlsiYmJwIiwibG5tY2UiLCJodHRwczovL2JicC5lcGZsLmNoL25ldXJvc2NpZW5jZWdyYXBoL2RhdGEvdHJhY2VzLzQ2MGJmYTJlLWNiN2QtNDQyMC1hNDQ4LTIwMzBhNmJmNGFlNCIsMTVdfSx7Il9zZWxmIjoiaHR0cHM6Ly9iYnAuZXBmbC5jaC9uZXh1cy92MS9yZXNvdXJjZXMvYmJwL2F0bGFzL2RhdGFzaGFwZXM6YXRsYXNzcGF0aWFscmVmZXJlbmNlc3lzdGVtL2FsbGVuX2NjZnYzX3NwYXRpYWxfcmVmZXJlbmNlX3N5c3RlbSIsInRpdGxlIjoiQWxsZW4gTW91c2UgQ0NGIiwidHlwZXMiOlsiQXRsYXNTcGF0aWFsUmVmZXJlbmNlU3lzdGVtIiwiQnJhaW5BdGxhc1NwYXRpYWxSZWZlcmVuY2VTeXN0ZW0iXSwicmVzb3VyY2UiOlsiYmJwIiwiYXRsYXMiLCJodHRwczovL2JicC5lcGZsLmNoL25ldXJvc2NpZW5jZWdyYXBoL2RhdGEvYWxsZW5fY2NmdjNfc3BhdGlhbF9yZWZlcmVuY2Vfc3lzdGVtIiw5XX1dLCJzaHJpbmtlZCI6ZmFsc2UsImhpZ2hsaWdodEluZGV4IjotMX0=';
const digestCurrentSelf =
  'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:volumetricdatalayer/cce06e96-85a4-403d-8b87-634a1554cdb9';
const initialDataExplorerState = {
  current: {
    isDownloadable: false,
    _self:
      'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.417881.3',
    title: 'Allen Institute for Brain Science',
    types: ['Agent', 'Organization'],
    resource: [
      'bbp',
      'atlas',
      'https://www.grid.ac/institutes/grid.417881.3',
      1,
    ],
  },
  links: [
    {
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/lnmce/datashapes:dataset/traces%2F460bfa2e-cb7d-4420-a448-2030a6bf4ae4',
      title: '001_141216_A1_CA1py_R_MPG',
      types: ['Entity', 'Trace', 'Dataset'],
      resource: [
        'bbp',
        'lnmce',
        'https://bbp.epfl.ch/neurosciencegraph/data/traces/460bfa2e-cb7d-4420-a448-2030a6bf4ae4',
      ],
    },
    {
      isDownloadable: false,
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      title: 'Ecole Polytechnique Federale de Lausanne',
      types: ['Organization', 'prov#Agent'],
      resource: [
        'bbp',
        'atlas',
        'https://www.grid.ac/institutes/grid.5333.6',
        1,
      ],
    },
  ],
  shrinked: false,
  highlightIndex: -1,
  limited: false,
};
const fourthItemInStack = {
  isDownloadable: false,
  _self:
    'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/datashapes:ontologyentity/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fefeatures%2FAHPAmplitude',
  title: 'AHP Amplitude',
  types: ['Class'],
  resource: [
    'neurosciencegraph',
    'datamodels',
    'https://bbp.epfl.ch/ontologies/core/efeatures/AHPAmplitude',
    28,
  ],
};
describe('NavigationStack', () => {
  let app: JSX.Element;
  let component: RenderResult;
  let container: HTMLElement;
  let rerender: (ui: React.ReactElement) => void;
  let store: Store<any, AnyAction>;
  let user: UserEvent;
  let history: MemoryHistory<{}>;
  let nexus: NexusClient;

  beforeEach(() => {
    history = createMemoryHistory({});

    nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    store = configureStore(history, { nexus }, {});
    app = (
      <Provider store={store}>
        <Router history={history}>
          <NexusProvider nexusClient={nexus}>
            <>
              <NavigationStack />
              <NavigationCollapseButton />
              <NavigationBack />
            </>
          </NexusProvider>
        </Router>
      </Provider>
    );
    component = render(app);
    container = component.container;
    rerender = component.rerender;
    user = userEvent.setup();
  });

  it('should render the correct number of NavigationStackItem components in the state', () => {
    store.dispatch(
      ResetDataExplorerGraphFlow({ initialState: initialDataExplorerState })
    );
    rerender(app);
    const navigationItems = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more)'
    );
    expect(navigationItems.length).toBe(2);
  });
  it('should render the correct number of NavigationStackItem components after hit the return back btn', () => {
    // create a new store with preloaded state
    store.dispatch(
      ResetDataExplorerGraphFlow({ initialState: initialDataExplorerState })
    );
    store.dispatch(ReturnBackDataExplorerGraphFlow());
    rerender(app);
    const navigationItemsAfterBack = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more)'
    );
    expect(navigationItemsAfterBack.length).toBe(1);
  });
  it('should render the correct number of NavigationStackItem after multiple navigation', () => {
    store.dispatch(
      ResetDataExplorerGraphFlow({ initialState: initialDataExplorerState })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/_/https:%2F%2Fbbp.neuroshapes.org',
        title: 'bbp.neuroshapes.org',
        types: [],
        resource: ['bbp', 'atlas', 'https://bbp.neuroshapes.org', 1],
      })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/_/https:%2F%2Fneuroshapes.org',
        title: 'neuroshapes.org',
        types: [],
        resource: [
          'neurosciencegraph',
          'datamodels',
          'https://neuroshapes.org',
          161,
        ],
      })
    );
    store.dispatch(AddNewNodeDataExplorerGraphFlow(fourthItemInStack));
    rerender(app);
    const navigationItemsAfterMultipleNavigation = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more)'
    );
    expect(navigationItemsAfterMultipleNavigation.length).toBe(5);
    const state = store.getState();
    expect(state.dataExplorer.links.length).toBe(5);
  });
  it('should render the NavigationStackShrinkedItem when it passed MAX_NAVIGATION_ITEMS_IN_STACK', () => {
    store.dispatch(
      ResetDataExplorerGraphFlow({ initialState: initialDataExplorerState })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/_/https:%2F%2Fbbp.neuroshapes.org',
        title: 'bbp.neuroshapes.org',
        types: [],
        resource: ['bbp', 'atlas', 'https://bbp.neuroshapes.org', 1],
      })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/datashapes:ontologyentity/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fefeatures%2FNeuroElectroNeuronElectrophysiologicalFeature',
        title: 'NeuroElectro Neuron Electrophysiological Feature',
        types: ['Class'],
        resource: [
          'neurosciencegraph',
          'datamodels',
          'https://bbp.epfl.ch/ontologies/core/efeatures/NeuroElectroNeuronElectrophysiologicalFeature',
          29,
        ],
      })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/_/https:%2F%2Fneuroshapes.org',
        title: 'neuroshapes.org',
        types: [],
        resource: [
          'neurosciencegraph',
          'datamodels',
          'https://neuroshapes.org',
          161,
        ],
      })
    );
    store.dispatch(AddNewNodeDataExplorerGraphFlow(fourthItemInStack));
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:atlasrelease/4906ab85-694f-469d-962f-c0174e901885',
        title: 'Blue Brain Atlas',
        types: ['AtlasRelease', 'BrainAtlasRelease'],
        resource: [
          'bbp',
          'atlas',
          'https://bbp.epfl.ch/neurosciencegraph/data/4906ab85-694f-469d-962f-c0174e901885',
          3,
        ],
      })
    );
    rerender(app);
    const navigationStackShrinkedItem = container.querySelectorAll(
      '.navigation-stack-item.more'
    );
    expect(navigationStackShrinkedItem.length).toBe(1);
    expect(navigationStackShrinkedItem).not.toBeNull();
    const navigationHiddenItems = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more):not(.more)[hidden]'
    );
    expect(navigationHiddenItems.length).toBe(5);
  });
  it('should show the collapse button when the NavigationStackShrinkedItem is clicked', async () => {
    store.dispatch(
      ResetDataExplorerGraphFlow({ initialState: initialDataExplorerState })
    );
    rerender(app);
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/_/https:%2F%2Fbbp.neuroshapes.org',
        title: 'bbp.neuroshapes.org',
        types: [],
        resource: ['bbp', 'atlas', 'https://bbp.neuroshapes.org', 1],
      })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/datashapes:ontologyentity/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fefeatures%2FNeuroElectroNeuronElectrophysiologicalFeature',
        title: 'NeuroElectro Neuron Electrophysiological Feature',
        types: ['Class'],
        resource: [
          'neurosciencegraph',
          'datamodels',
          'https://bbp.epfl.ch/ontologies/core/efeatures/NeuroElectroNeuronElectrophysiologicalFeature',
          29,
        ],
      })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/_/https:%2F%2Fneuroshapes.org',
        title: 'neuroshapes.org',
        types: [],
        resource: [
          'neurosciencegraph',
          'datamodels',
          'https://neuroshapes.org',
          161,
        ],
      })
    );
    store.dispatch(AddNewNodeDataExplorerGraphFlow(fourthItemInStack));
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:atlasrelease/4906ab85-694f-469d-962f-c0174e901885',
        title: 'Blue Brain Atlas',
        types: ['AtlasRelease', 'BrainAtlasRelease'],
        resource: [
          'bbp',
          'atlas',
          'https://bbp.epfl.ch/neurosciencegraph/data/4906ab85-694f-469d-962f-c0174e901885',
          3,
        ],
      })
    );
    rerender(app);
    const openShrinkedNavList = container.querySelector(
      '[role="open-shrinked-nav"]'
    );
    openShrinkedNavList && (await user.click(openShrinkedNavList));
    rerender(app);
    const collapseBtn = container.querySelector('.navigation-collapse-btn');
    expect(collapseBtn).not.toBeNull();
    expect(collapseBtn).toBeInTheDocument();
    expect(store.getState().dataExplorer.shrinked).toBe(false);
  });
  it('should the items in the stack be 4 when the user jump to the 5th item', async () => {
    store.dispatch(
      ResetDataExplorerGraphFlow({ initialState: initialDataExplorerState })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/_/https:%2F%2Fbbp.neuroshapes.org',
        title: 'bbp.neuroshapes.org',
        types: [],
        resource: ['bbp', 'atlas', 'https://bbp.neuroshapes.org', 1],
      })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/datashapes:ontologyentity/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fefeatures%2FNeuroElectroNeuronElectrophysiologicalFeature',
        title: 'NeuroElectro Neuron Electrophysiological Feature',
        types: ['Class'],
        resource: [
          'neurosciencegraph',
          'datamodels',
          'https://bbp.epfl.ch/ontologies/core/efeatures/NeuroElectroNeuronElectrophysiologicalFeature',
          29,
        ],
      })
    );
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/_/https:%2F%2Fneuroshapes.org',
        title: 'neuroshapes.org',
        types: [],
        resource: [
          'neurosciencegraph',
          'datamodels',
          'https://neuroshapes.org',
          161,
        ],
      })
    );
    store.dispatch(AddNewNodeDataExplorerGraphFlow(fourthItemInStack));
    store.dispatch(
      AddNewNodeDataExplorerGraphFlow({
        isDownloadable: false,
        _self:
          'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:atlasrelease/4906ab85-694f-469d-962f-c0174e901885',
        title: 'Blue Brain Atlas',
        types: ['AtlasRelease', 'BrainAtlasRelease'],
        resource: [
          'bbp',
          'atlas',
          'https://bbp.epfl.ch/neurosciencegraph/data/4906ab85-694f-469d-962f-c0174e901885',
          3,
        ],
      })
    );
    rerender(app);
    await waitFor(async () => {
      const forthNode = container.querySelector(
        '.navigation-stack-item.item-4 > .anticon.anticon-plus'
      );
      if (forthNode) {
        await user.click(forthNode);
        rerender(app);
        const navigationItems = container.querySelectorAll(
          '.navigation-stack-item:not(.no-more)'
        );
        expect(navigationItems.length).toBe(4);
        const state = store.getState();
        expect(state.dataExplorer.current._self).toEqual(
          fourthItemInStack._self
        );
      }
    });
  });
  it('should decode the navigation digest at first render', () => {
    store.dispatch(ResetDataExplorerGraphFlow({ initialState: null }));
    store.dispatch(PopulateDataExplorerGraphFlow(sampleDigest));
    render(app);
    const dataExplorerState = store.getState().dataExplorer;
    expect(dataExplorerState.links.length).toBe(2);
    expect(dataExplorerState.current._self).toBe(digestCurrentSelf);
    expect(dataExplorerState.shrinked).toBe(false);
  });
});
