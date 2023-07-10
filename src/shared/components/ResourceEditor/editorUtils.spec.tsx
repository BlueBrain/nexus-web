import '@testing-library/jest-dom';
import React from 'react';
import { editorLinkResolutionHandler } from './editorUtils';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { NexusClient, createNexusClient } from '@bbp/nexus-sdk';
import { Router } from 'react-router-dom';
import { NexusProvider } from '@bbp/react-nexus';
import { AnyAction, Store } from 'redux';
import { QueryClientProvider, QueryClient } from 'react-query';
import configureStore from '../../store';
import {
  resourceFromSearchApiId,
  resourceFromSearchApi,
} from '../../../__mocks__/handlers/ResourceEditor/handlers';
import { deltaPath } from '../../../__mocks__/handlers/handlers';
import { getResourceLabel } from '../../utils';
import {
  render,
  screen,
  waitFor,
  cleanup,
  RenderResult,
} from '../../../utils/testUtil';
import ResolvedLinkEditorPopover from '../../molecules/ResolvedLinkEditorPopover/ResolvedLinkEditorPopover';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import { ResourceResolutionFetchFn } from './ResourcesLRUCache';

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

const INVALID_URL = 'https://bbp.epfl.ch/nexus/v1/resources/bbp/lnmce/invalid';
const testFetcher: ResourceResolutionFetchFn = async (
  key,
  { fetchContext }
) => {
  const { resourceId } = fetchContext;
  if (resourceId === INVALID_URL) {
    return Promise.resolve({
      type: 'error',
      data: new Error('Resource can not be resolved'),
    });
  }
  if (decodeURIComponent(resourceId) === resourceFromSearchApiId) {
    return {
      data: resourceFromSearchApi,
      type: 'search-api',
    };
  }
  return {
    data: new Error('Not found'),
    type: 'error',
  };
};

describe('resolveLinkInEditor', () => {
  const queryClient = new QueryClient();
  let store: Store<any, AnyAction>;
  const defaultPaylaod = { top: 0, left: 0, open: true };
  let nexus: NexusClient;
  let TestApp: JSX.Element;
  let component: RenderResult;
  let rerender: (ui: React.ReactElement) => void;

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
  // case-resource: can not be tested since codemirror issue and redirection
  // case-error: link can not be resolved by the project resolver nor the search api and it's not external
  it('should return null if the url is not valid', async () => {
    const { resolvedAs, error, results } = await editorLinkResolutionHandler({
      nexus,
      url: INVALID_URL,
      apiEndpoint: '/',
      orgLabel: 'orgLabel',
      projectLabel: 'projectLabel',
      fetcher: testFetcher,
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
        apiEndpoint: '/',
        url: resourceFromSearchApiId,
        orgLabel: orgProject?.orgLabel,
        projectLabel: orgProject?.projectLabel,
        fetcher: testFetcher,
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
});
