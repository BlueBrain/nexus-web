import '@testing-library/jest-dom';
import React from 'react';
import { getNormalizedTypes, editorLinkResolutionHandler } from './editorUtils';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { NexusClient, createNexusClient } from '@bbp/nexus-sdk';
import { deltaPath } from '__mocks__/handlers/handlers';
import configureStore from '../../../shared/store';
import { Router } from 'react-router-dom';
import { NexusProvider } from '@bbp/react-nexus';
import { AnyAction, Store } from 'redux';
import { QueryClientProvider, QueryClient } from 'react-query';
import { setupServer } from 'msw/node';
import {
  resourceFromSearchApiId,
  resourceFromSearchApi,
  getResolverResponseObject,
  getSearchApiResponseObject,
} from '../../../__mocks__/handlers/ResourceEditor/handlers';
import { getResourceLabel } from '../../utils';
import {
  render,
  screen,
  waitFor,
  cleanup,
  RenderResult,
} from '../../../utils/testUtil';
import ResolvedLinkEditorPopover from '../../molecules/ResolvedLinkEditorPopover/ResolvedLinkEditorPopover';
import { UISettingsActionTypes } from 'shared/store/actions/ui-settings';

document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn(),
    };
  };

  return range;
};
describe('getNormalizedTypes', () => {
  const typesAsString = 'Resource';
  it('should return the normalized types', () => {
    const result = getNormalizedTypes(typesAsString);
    expect(result).toEqual(['Resource']);
  });

  const typesAsUrl = 'https://bluebrain.github.io/nexus/vocabulary/Resource';
  it('should return the normalized types', () => {
    const result = getNormalizedTypes(typesAsUrl);
    expect(result).toEqual(['Resource']);
  });

  const typesWithUrls = [
    'https://bluebrain.github.io/nexus/vocabulary/Schema',
    'https://bluebrain.github.io/nexus/vocabulary/Resource',
    'https://bluebrain.github.io/nexus/vocabulary/Project',
    'Realm',
    'NeuronMorphology',
  ];
  it('should return the normalized types', () => {
    const result = getNormalizedTypes(typesWithUrls);
    expect(result).toEqual([
      'Schema',
      'Resource',
      'Project',
      'Realm',
      'NeuronMorphology',
    ]);
  });
});

describe('resolveLinkInEditor', () => {
  const queryClient = new QueryClient();
  let store: Store<any, AnyAction>;
  let server: ReturnType<typeof setupServer>;
  const defaultPaylaod = { top: 0, left: 0, open: true };
  let nexus: NexusClient;
  let TestApp: JSX.Element;
  let component: RenderResult;
  let rerender: (ui: React.ReactElement) => void;

  beforeAll(() => {
    server = setupServer(getResolverResponseObject, getSearchApiResponseObject);
    server.listen();
  });

  beforeEach(async () => {
    const history = createMemoryHistory({});
    nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    store = configureStore(history, { nexus }, {});
    TestApp = (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>
            <NexusProvider nexusClient={nexus}>
              <ResolvedLinkEditorPopover />
            </NexusProvider>
          </Router>
        </QueryClientProvider>
      </Provider>
    );
    component = render(TestApp);
    rerender = component.rerender;
  });

  afterEach(async () => {
    cleanup();
  });
  afterAll(() => {
    server.resetHandlers();
    server.close();
  });
  // case-resource: can not be tested since codemirror issue and redirection
  // case-error: link can not be resolved by the project resolver nor the search api and it's not external
  it('should return null if the url is not valid', async () => {
    const url = 'https://bbp.epfl.ch/nexus/v1/resources/bbp/lnmce/invalid';
    const { resolvedAs, error, results } = await editorLinkResolutionHandler({
      nexus,
      url,
      orgLabel: 'orgLabel',
      projectLabel: 'projectLabel',
    });
    store.dispatch({
      type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
      payload: {
        ...defaultPaylaod,
        resolvedAs,
        error,
        results,
      },
    });
    rerender(TestApp);
    expect(
      store.getState().uiSettings.editorPopoverResolvedData.results
    ).toBeUndefined();
    expect(
      store.getState().uiSettings.editorPopoverResolvedData.resolvedAs
    ).toEqual('error');
  });
  // case-resources: link can be resolved by search api and has multiple results
  it('should show popover when the link is resolved by search api with multiple results', async () => {
    const orgProject = {
      orgLabel: 'bbp',
      projectLabel: 'lnmce',
    };
    await waitFor(async () => {
      const { resolvedAs, error, results } = await editorLinkResolutionHandler({
        nexus,
        url: resourceFromSearchApiId,
        orgLabel: orgProject?.orgLabel,
        projectLabel: orgProject?.projectLabel,
      });
      store.dispatch({
        type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
        payload: {
          ...defaultPaylaod,
          resolvedAs,
          error,
          results,
        },
      });
      rerender(TestApp);
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.results
      ).toBeDefined();
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.results.length
      ).toEqual(resourceFromSearchApi._total);
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.resolvedAs
      ).toBe('resources');
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.error
      ).toBeUndefined();
      for (const item in resourceFromSearchApi._results) {
        const nameMatch = new RegExp(
          getResourceLabel(resourceFromSearchApi._results[item]),
          'i'
        );
        const namesInScreen = await screen.findAllByText(nameMatch);
        for (const nameInScreen of namesInScreen) {
          expect(nameInScreen).toBeInTheDocument();
        }
      }
    });
  });
  // case-external: link can not be resolved by the project resolver nor the search api and it's external
  it('should show popover when external link is provided', async () => {
    const url = 'ftp://www.google.com';
    await waitFor(async () => {
      const { resolvedAs, error, results } = await editorLinkResolutionHandler({
        nexus,
        url,
        orgLabel: 'orgLabel',
        projectLabel: 'projectLabel',
      });
      store.dispatch({
        type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
        payload: {
          ...defaultPaylaod,
          resolvedAs,
          error,
          results,
        },
      });
      rerender(TestApp);
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.results._self
      ).toEqual(url);
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.resolvedAs
      ).toEqual('external');
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.error
      ).toBeUndefined();
    });
  });
});
