import '@testing-library/jest-dom';
import React from 'react';
import { resolveLinkInEditor, getNormalizedTypes } from './editorUtils';
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
  resourceResolverApi,
  resourceFromSearchApiId,
  resourceFromSearchApi,
  getResolverResponseObject,
  getSearchApiResponseObject,
} from '../../../__mocks__/handlers/ResourceEditor/handlers';
import {
  getOrgAndProjectFromResourceObject,
  getResourceLabel,
} from '../../utils';
import { render, screen, waitFor, act, cleanup } from '../../../utils/testUtil';
import ResolvedLinkEditorPopover from '../../molecules/ResolvedLinkEditorPopover/ResolvedLinkEditorPopover';

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
  beforeAll(() => {
    server = setupServer(getResolverResponseObject, getSearchApiResponseObject);
    server.listen();
  });

  beforeAll(async () => {
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
  });
  beforeEach(async () => {
    await act(async () => {
      await render(TestApp);
    });
  });
  afterEach(async () => {
    cleanup();
  });
  afterAll(() => {
    server.resetHandlers();
    server.close();
  });
  // case-0: the url is not valid
  it('should return null if the url is not valid', async () => {
    const url = 'not a valid url';
    const result = await resolveLinkInEditor({
      nexus,
      url,
      defaultPaylaod,
      dispatch: store.dispatch,
      orgLabel: 'orgLabel',
      projectLabel: 'projectLabel',
    });
    expect(
      store.getState().uiSettings.editorPopoverResolvedData.results.length
    ).toEqual(0);
    expect(
      store.getState().uiSettings.editorPopoverResolvedData.resolvedAs
    ).toBeUndefined();
    expect(result).toBeNull();
  });
  // case-1: url is valid and link resolved by the project resolver
  it('should show popover when the link is resolved by the project resolver if the url is valid', async () => {
    const orgProject = getOrgAndProjectFromResourceObject(resourceResolverApi);
    const name = getResourceLabel(resourceResolverApi);
    await waitFor(async () => {
      await resolveLinkInEditor({
        nexus,
        defaultPaylaod: { ...defaultPaylaod, top: 400, left: 400 },
        url: resourceResolverApi['@id'],
        dispatch: store.dispatch,
        orgLabel: orgProject?.orgLabel,
        projectLabel: orgProject?.projectLabel,
      });
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.results
      ).toBeDefined();
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.results._self
      ).toEqual(resourceResolverApi._self);
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.resolvedAs
      ).toBe('resource');
      expect(
        store.getState().uiSettings.editorPopoverResolvedData.error
      ).toBeNull();
    });
    await waitFor(
      async () => {
        const nameMatch = new RegExp(name, 'i');
        const nameInScreen = await screen.findByText(nameMatch);
        expect(nameInScreen).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
  // case-2: link can not be resolved by the project resolver
  // then try to find it across all projects
  it('should show popover when the link is resolved by search api and resolver can not resolve it if the url is valid', async () => {
    const orgProject = {
      orgLabel: 'bbp',
      projectLabel: 'lnmce',
    };
    await waitFor(async () => {
      await resolveLinkInEditor({
        nexus,
        defaultPaylaod: { ...defaultPaylaod, top: 400, left: 400 },
        url: resourceFromSearchApiId,
        dispatch: store.dispatch,
        orgLabel: orgProject.orgLabel,
        projectLabel: orgProject.projectLabel,
      });
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
  // case-3: link can not be resolved by the project resolver and search api and it's an external link
  it('shoudl show popover when external link is provided', async () => {
    const url = 'ftp://www.google.com';
    await waitFor(async () => {
      await resolveLinkInEditor({
        nexus,
        url,
        defaultPaylaod: { ...defaultPaylaod, top: 400, left: 400 },
        dispatch: store.dispatch,
        orgLabel: 'orgLabel',
        projectLabel: 'projectLabel',
      });
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
    const urlMatch = new RegExp(url, 'i');
    const urlInScreen = await screen.findByText(urlMatch);
    expect(urlInScreen).toBeInTheDocument();
  });
});
