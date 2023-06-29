import '@testing-library/jest-dom';
import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import NavigationStack from './NavigationStack';
import { createNexusClient } from '@bbp/nexus-sdk';
import { AnyAction, Store } from 'redux';
import { NexusProvider } from '@bbp/react-nexus';
import { createMemoryHistory, MemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { Router } from 'react-router-dom';
import { deltaPath } from '__mocks__/handlers/handlers';
import {
  JumpToNodeDataExplorerGraphFlow,
  ReturnBackDataExplorerGraphFlow,
  AddNewNodeDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
  PopulateDataExplorerGraphFlow,
} from '../../../shared/store/reducers/data-explorer';
import configureStore from '../../store';

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
  beforeAll(() => {
    const nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });

    history = createMemoryHistory({});
    store = configureStore(
      history,
      { nexus },
      { dataExplorer: initialDataExplorerState }
    );
    app = (
      <Provider store={store}>
        <Router history={history}>
          <NexusProvider nexusClient={nexus}>
            <NavigationStack />
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
    const navigationItems = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more)'
    );
    expect(navigationItems.length).toBe(2);
  });
  it('should render the correct number of NavigationStackItem components after hit the return back btn', () => {
    store.dispatch(ReturnBackDataExplorerGraphFlow());
    rerender(app);
    const navigationItemsAfterBack = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more)'
    );
    expect(navigationItemsAfterBack.length).toBe(1);
  });
  it('should render the correct number of NavigationStackItem after multiple navigation', () => {
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
    rerender(app);
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
    render(app);
    store.dispatch(AddNewNodeDataExplorerGraphFlow(fourthItemInStack));
    render(app);
    const navigationItemsAfterMultipleNavigation = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more)'
    );
    expect(navigationItemsAfterMultipleNavigation.length).toBe(4);
    const state = store.getState();
    expect(state.dataExplorer.links.length).toBe(4);
  });
  it('should render the NavigationStackShrinkedItem when it passed MAX_NAVIGATION_ITEMS_IN_STACK', () => {
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
    rerender(app);
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
    expect(navigationHiddenItems.length).toBe(4);
  });
  it('should show the collapse button when the NavigationStackShrinkedItem is clicked', () => {
    const navigationStackShrinkedItem = container.querySelector(
      '.navigation-stack-item.more'
    );
    if (navigationStackShrinkedItem) {
      user.click(navigationStackShrinkedItem);
      const collapseBtn = container.querySelector('.navigation-collapse-btn');
      expect(collapseBtn).not.toBeNull();
      expect(collapseBtn).toBeInTheDocument();
      expect(store.getState().dataExplorer.shrinked).toBe(false);
    }
  });
  it('should hide the collapse button when the collapse button is clicked', () => {
    const navigationCollapseButton = container.querySelector(
      '.navigation-collapse-btn'
    );
    if (navigationCollapseButton) {
      user.click(navigationCollapseButton);
      const collapseBtn = container.querySelector('.navigation-collapse-btn');
      expect(collapseBtn).toBeNull();
      expect(store.getState().dataExplorer.shrinked).toBe(true);
    }
  });
  it('should the items in the stack be 4 when the user jump to the 5th item', () => {
    store.dispatch(JumpToNodeDataExplorerGraphFlow(4));
    rerender(app);
    const navigationStackShrinkedItem = container.querySelector(
      '.navigation-stack-item.more'
    );
    expect(navigationStackShrinkedItem).toBeNull();
    const navigationItems = container.querySelectorAll(
      '.navigation-stack-item:not(.no-more)'
    );
    expect(navigationItems.length).toBe(4);
  });
  it('should the fourth item in the stack will be the current one when the user jump to the 4th item', () => {
    const state = store.getState();
    expect(state.dataExplorer.current._self).toEqual(fourthItemInStack._self);
  });
  it('should decode the navigation digest when refresh the page', () => {
    store.dispatch(ResetDataExplorerGraphFlow());
    store.dispatch(PopulateDataExplorerGraphFlow(sampleDigest));
    render(app);
    const dataExplorerState = store.getState().dataExplorer;
    expect(dataExplorerState.links.length).toBe(2);
    expect(dataExplorerState.current._self).toBe(digestCurrentSelf);
    expect(dataExplorerState.shrinked).toBe(false);
  });
});
