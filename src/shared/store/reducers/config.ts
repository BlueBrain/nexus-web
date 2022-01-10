import { ConfigActions } from '../actions/config';

export const DEFAULT_SEARCH_CONFIG_PROJECT = 'webapps/nexus-web';

export interface ConfigState {
  apiEndpoint: string;
  basePath: string;
  clientId: string;
  redirectHostName: string;
  preferredRealm?: string;
  sentryDsn?: string;
  pluginsManifestPath: string;
  subAppsManifestPath: string;
  gtmCode?: string;
  studioView?: string;
  searchSettings: {
    searchConfigProject: string;
  };
  layoutSettings: {
    docsLink: string;
    logoImg: string;
    forgeLink: string;
  };
  dataModelsLocation: string;
}

const initialState: ConfigState = {
  apiEndpoint: '/',
  basePath: '',
  clientId: '',
  redirectHostName: '',
  pluginsManifestPath: '/public/plugins',
  subAppsManifestPath: '/public/sub-apps',
  gtmCode: '',
  layoutSettings: {
    docsLink: '',
    logoImg: '',
    forgeLink: '',
  },
  searchSettings: {
    searchConfigProject: DEFAULT_SEARCH_CONFIG_PROJECT,
  },
  dataModelsLocation: '',
};

export default function configReducer(
  state: ConfigState = initialState,
  action: ConfigActions
): ConfigState {
  switch (action.type) {
    case '@@nexus/CONFIG_SET_REALM':
      return { ...state, preferredRealm: action.name };
    default:
      return state;
  }
}
