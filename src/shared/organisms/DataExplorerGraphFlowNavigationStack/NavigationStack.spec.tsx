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
import { deltaPath } from '../../../__mocks__/handlers/handlers';
import configureStore from '../../store';
import {
  AddNewNodeDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
  PopulateDataExplorerGraphFlow,
  TDataExplorerState,
  ExpandNavigationStackDataExplorerGraphFlow,
  ShrinkNavigationStackDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import NavigationStack from './NavigationStack';

const sampleDigest =
  'eyJjdXJyZW50Ijp7ImlzRG93bmxvYWRhYmxlIjpmYWxzZSwiX3NlbGYiOiJodHRwczovL2JicC5lcGZsLmNoL25leHVzL3YxL3Jlc291cmNlcy9iYnAvYXRsYXMvZGF0YXNoYXBlczp2b2x1bWV0cmljZGF0YWxheWVyL2RjYTQwZjk5LWI0OTQtNGQyYy05YTJmLWM0MDcxODAxMzhiNyIsInRpdGxlIjoiYXZlcmFnZV90ZW1wbGF0ZV8yNSIsInR5cGVzIjpbIkJyYWluVGVtcGxhdGVEYXRhTGF5ZXIiLCJWb2x1bWV0cmljRGF0YUxheWVyIl0sInJlc291cmNlIjpbImJicCIsImF0bGFzIiwiaHR0cHM6Ly9iYnAuZXBmbC5jaC9uZXVyb3NjaWVuY2VncmFwaC9kYXRhL2RjYTQwZjk5LWI0OTQtNGQyYy05YTJmLWM0MDcxODAxMzhiNyIsOF19LCJsZWZ0Tm9kZXMiOnsibGlua3MiOlt7ImlzRG93bmxvYWRhYmxlIjpmYWxzZSwiX3NlbGYiOiJodHRwczovL2JicC5lcGZsLmNoL25leHVzL3YxL3Jlc291cmNlcy9iYnAvbG5tY2UvZGF0YXNoYXBlczpkYXRhc2V0L3RyYWNlcyUyRjYwOTBiNWZlLTU0YmYtNDRiNC1hZjU5LWE0NmE5YmI4MWZhYyIsInRpdGxlIjoiMDAxXzE1MDMwNF9BMl9DQTFweV9NUEciLCJ0eXBlcyI6WyJUcmFjZSIsIkRhdGFzZXQiLCJFbnRpdHkiXSwicmVzb3VyY2UiOlsiYmJwIiwibG5tY2UiLCJodHRwczovL2JicC5lcGZsLmNoL25ldXJvc2NpZW5jZWdyYXBoL2RhdGEvdHJhY2VzLzYwOTBiNWZlLTU0YmYtNDRiNC1hZjU5LWE0NmE5YmI4MWZhYyIsMTddfSx7ImlzRG93bmxvYWRhYmxlIjpmYWxzZSwiX3NlbGYiOiJodHRwczovL2JicC5lcGZsLmNoL25leHVzL3YxL3Jlc291cmNlcy9iYnAvYXRsYXMvZGF0YXNoYXBlczphdGxhc3JlbGVhc2UvODMxYTYyNmEtYzBhZS00NjkxLThjZTgtY2ZiNzQ5MTM0NWQ5IiwidGl0bGUiOiJBbGxlbiBNb3VzZSBDQ0YgdjMiLCJ0eXBlcyI6WyJCcmFpbkF0bGFzUmVsZWFzZSIsIkF0bGFzUmVsZWFzZSJdLCJyZXNvdXJjZSI6WyJiYnAiLCJhdGxhcyIsImh0dHBzOi8vYmJwLmVwZmwuY2gvbmV1cm9zY2llbmNlZ3JhcGgvZGF0YS84MzFhNjI2YS1jMGFlLTQ2OTEtOGNlOC1jZmI3NDkxMzQ1ZDkiLDRdfV0sInNocmlua2VkIjpmYWxzZX0sInJpZ2h0Tm9kZXMiOnsibGlua3MiOlt7ImlzRG93bmxvYWRhYmxlIjpmYWxzZSwiX3NlbGYiOiJodHRwczovL2JicC5lcGZsLmNoL25leHVzL3YxL3Jlc291cmNlcy9iYnAvYXRsYXMvZGF0YXNoYXBlczphdGxhc3NwYXRpYWxyZWZlcmVuY2VzeXN0ZW0vYWxsZW5fY2NmdjNfc3BhdGlhbF9yZWZlcmVuY2Vfc3lzdGVtIiwidGl0bGUiOiJBbGxlbiBNb3VzZSBDQ0YiLCJ0eXBlcyI6WyJBdGxhc1NwYXRpYWxSZWZlcmVuY2VTeXN0ZW0iLCJCcmFpbkF0bGFzU3BhdGlhbFJlZmVyZW5jZVN5c3RlbSJdLCJyZXNvdXJjZSI6WyJiYnAiLCJhdGxhcyIsImh0dHBzOi8vYmJwLmVwZmwuY2gvbmV1cm9zY2llbmNlZ3JhcGgvZGF0YS9hbGxlbl9jY2Z2M19zcGF0aWFsX3JlZmVyZW5jZV9zeXN0ZW0iLDldfSx7ImlzRG93bmxvYWRhYmxlIjpmYWxzZSwiX3NlbGYiOiJodHRwczovL2JicC5lcGZsLmNoL25leHVzL3YxL3Jlc291cmNlcy9iYnAvYXRsYXMvZGF0YXNoYXBlczpvcmdhbml6YXRpb24vaHR0cHM6JTJGJTJGd3d3LmdyaWQuYWMlMkZpbnN0aXR1dGVzJTJGZ3JpZC40MTc4ODEuMyIsInRpdGxlIjoiQWxsZW4gSW5zdGl0dXRlIGZvciBCcmFpbiBTY2llbmNlIiwidHlwZXMiOlsiQWdlbnQiLCJPcmdhbml6YXRpb24iXSwicmVzb3VyY2UiOlsiYmJwIiwiYXRsYXMiLCJodHRwczovL3d3dy5ncmlkLmFjL2luc3RpdHV0ZXMvZ3JpZC40MTc4ODEuMyIsMV19XSwic2hyaW5rZWQiOmZhbHNlfSwicmVmZXJlciI6eyJwYXRobmFtZSI6Ii9iYnAvbG5tY2UvcmVzb3VyY2VzL2h0dHBzJTNBJTJGJTJGYmJwLmVwZmwuY2glMkZuZXVyb3NjaWVuY2VncmFwaCUyRmRhdGElMkZ0cmFjZXMlMkY2MDkwYjVmZS01NGJmLTQ0YjQtYWY1OS1hNDZhOWJiODFmYWMiLCJzZWFyY2giOiIiLCJzdGF0ZSI6eyJiYWNrZ3JvdW5kIjp7InBhdGhuYW1lIjoiL3NlYXJjaCIsInNlYXJjaCI6Ij9sYXlvdXQ9TmV1cm9uIEVsZWN0cm9waHlzaW9sb2d5IiwiaGFzaCI6IiIsImtleSI6ImdvNnNhZCJ9fX19';
const digestCurrentSelf =
  'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:volumetricdatalayer/dca40f99-b494-4d2c-9a2f-c407180138b7';
const initialDataExplorerState: TDataExplorerState = {
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
  leftNodes: {
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
          1,
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
  },
  rightNodes: {
    links: [],
    shrinked: false,
  },
  fullscreen: false,
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
              <NavigationStack key="navigation-stack-left" side="left" />
              <NavigationStack key="navigation-stack-right" side="right" />
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
      '.navigation-stack-item:not(.more)'
    );
    expect(navigationItemsAfterMultipleNavigation.length).toBe(5);
    const state = store.getState();
    expect(state.dataExplorer.leftNodes.links.length).toBe(5);
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
    expect(openShrinkedNavList).not.toBeNull();
    expect(openShrinkedNavList).toBeInTheDocument();
    openShrinkedNavList && (await user.click(openShrinkedNavList));
    rerender(app);
    const collapseBtn = container.querySelector('.collapse-btn');
    expect(collapseBtn).not.toBeNull();
    expect(collapseBtn).toBeInTheDocument();
    expect(store.getState().dataExplorer.leftNodes.shrinked).toBe(false);
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
    store.dispatch(AddNewNodeDataExplorerGraphFlow(fourthItemInStack));
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
    // select by class and role of open-naivation-item
    const forthNodeNavigationItem = container.querySelector(
      '.navigation-stack-item.left.item-4 .navigation-stack-item__wrapper > .icon[role="open-navigation-item"]'
    );
    expect(forthNodeNavigationItem).not.toBeNull();
    expect(forthNodeNavigationItem).toBeInTheDocument();
    forthNodeNavigationItem && (await user.click(forthNodeNavigationItem));
    rerender(app);
    const navigationLeftItems = container.querySelectorAll(
      '.navigation-stack-item.left:not(.more)'
    );
    expect(navigationLeftItems.length).toBe(4);
    const navigationRightItems = container.querySelectorAll(
      '.navigation-stack-item.right:not(.more)'
    );
    expect(navigationRightItems.length).toBe(3);
    const state = store.getState();
    expect(state.dataExplorer.current._self).toEqual(fourthItemInStack._self);
  });
  it('should decode the navigation digest at first render', () => {
    store.dispatch(ResetDataExplorerGraphFlow({ initialState: null }));
    store.dispatch(PopulateDataExplorerGraphFlow(sampleDigest));
    rerender(app);
    const dataExplorerState = store.getState().dataExplorer;
    expect(dataExplorerState.leftNodes.links.length).toBe(2);
    expect(dataExplorerState.rightNodes.links.length).toBe(2);
    expect(dataExplorerState.current._self).toBe(digestCurrentSelf);
  });
});
