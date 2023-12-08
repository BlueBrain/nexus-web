import '@testing-library/jest-dom';

import { createNexusClient, NexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { AnyAction, Store } from 'redux';

import { deltaPath } from '../../../__mocks__/handlers/handlers';
import { configureStore } from '../../../store';
import {
  ResetDataExplorerGraphFlow,
  TDataExplorerState,
} from '../../store/reducers/data-explorer';
import NavigationArrows from './NavigationArrows';
import NavigationStack from './NavigationStack';

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
    links: [
      {
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
      },
      {
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
      },
      {
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
      },
    ],
    shrinked: false,
  },
  fullscreen: false,
  referer: {
    pathname: '/my-data',
    search: '',
    state: {},
  },
};

const getButtonElement = (container: HTMLElement, side: 'back' | 'forward') => {
  return container.querySelector(
    `.navigation-arrow-btn[aria-label="${side}-arrow"]`
  );
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
              <NavigationArrows />
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

    store.dispatch(
      ResetDataExplorerGraphFlow({ initialState: initialDataExplorerState })
    );
    rerender(app);
  });

  it('should render the back/forward arrows as not disabled', () => {
    const backArrow = container.querySelector('[aria-label="back-arrow"]');
    const forwardArrow = getButtonElement(container, 'forward');
    expect(backArrow).toBeInTheDocument();
    expect(forwardArrow).toBeInTheDocument();
  });
  it('should left side of navigation become 3 and right side become 2 when Forward btn clicked', async () => {
    const forwardArrow = getButtonElement(container, 'forward');
    expect(forwardArrow).toBeInTheDocument();
    forwardArrow && (await user.click(forwardArrow));
    rerender(app);
    expect(store.getState().dataExplorer.leftNodes.links.length).toEqual(3);
    expect(store.getState().dataExplorer.rightNodes.links.length).toEqual(2);
  });
  it('should left side of navigation become 1 and right side become 4 when Back btn clicked', async () => {
    const backArrow = getButtonElement(container, 'back');
    expect(backArrow).toBeInTheDocument();
    backArrow && (await user.click(backArrow));
    rerender(app);
    expect(store.getState().dataExplorer.leftNodes.links.length).toEqual(1);
    expect(store.getState().dataExplorer.rightNodes.links.length).toEqual(4);
  });
  it('should forward btn disappear when there is no more forward navigation', async () => {
    for (const _ of store.getState().dataExplorer.rightNodes.links) {
      const forwardArrow = getButtonElement(container, 'forward');
      expect(forwardArrow).toBeInTheDocument();
      forwardArrow && (await user.click(forwardArrow));
      rerender(app);
    }
    expect(store.getState().dataExplorer.leftNodes.links.length).toEqual(5);
    expect(store.getState().dataExplorer.rightNodes.links.length).toEqual(0);
    const forwardArrowAfterFullNavigation = getButtonElement(
      container,
      'forward'
    );
    expect(forwardArrowAfterFullNavigation).toBeNull();
  });
  it('should return to /my-data when there is no more back navigation', async () => {
    for (const _ of store.getState().dataExplorer.leftNodes.links) {
      const backArrow = getButtonElement(container, 'back');
      expect(backArrow).toBeInTheDocument();
      backArrow && (await user.click(backArrow));
      rerender(app);
    }
    expect(store.getState().dataExplorer.leftNodes.links.length).toEqual(0);
    const lastBackArrow = getButtonElement(container, 'back');
    expect(lastBackArrow).toBeInTheDocument();
    lastBackArrow && (await user.click(lastBackArrow));
    expect(history.location.pathname).toEqual('/my-data');
  });
});
