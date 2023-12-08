import { ConfigActions } from '../actions/config';

export const DEFAULT_SEARCH_CONFIG_PROJECT = 'webapps/nexus-web';
export const DEFAULT_SERVICE_ACCOUNTS_REALM = 'serviceaccounts';

export interface ConfigState {
  apiEndpoint: string;
  basePath: string;
  clientId: string;
  redirectHostName: string;
  preferredRealm?: string;
  serviceAccountsRealm: string;
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
    logoImgLink: string;
    forgeLink: string;
    organizationImg: string;
    projectsImg: string;
    studiosImg: string;
    projectImg: string;
    landingVideo: string;
    landingPosterImg: string;
    mainColor: string;
  };
  dataModelsLocation: string;
  jiraUrl: string;
  jiraResourceCustomFieldName: string;
  jiraResourceCustomFieldLabel: string;
  jiraProjectCustomFieldName: string;
  jiraProjectCustomFieldLabel: string;
  jiraSupportedRealms?: string[];

  analysisPluginShowOnTypes: string[];
  analysisPluginExcludeTypes: string[];
  analysisPluginSparqlDataQuery: string;
  analysisPluginCategories: {
    [resourceType: string]: { label: string; description: string }[];
  };
  analysisPluginTypes: { label: string; description: string }[];
  httpHeaderForInaccessibleDueToVPN?: string;
}

const initialState: ConfigState = {
  apiEndpoint: '/',
  basePath: '',
  clientId: '',
  redirectHostName: '',
  pluginsManifestPath: '/public/plugins',
  subAppsManifestPath: '/public/sub-apps',
  serviceAccountsRealm: DEFAULT_SERVICE_ACCOUNTS_REALM,
  gtmCode: '',
  layoutSettings: {
    docsLink: '',
    logoImg: '',
    logoImgLink: '',
    forgeLink: '',
    projectImg: '',
    projectsImg: '',
    organizationImg: '',
    studiosImg: '',
    landingPosterImg: '',
    landingVideo: '',
    mainColor: '',
  },
  searchSettings: {
    searchConfigProject: DEFAULT_SEARCH_CONFIG_PROJECT,
  },
  dataModelsLocation: '',
  jiraUrl: '',
  jiraResourceCustomFieldName: '',
  jiraResourceCustomFieldLabel: '',
  jiraProjectCustomFieldName: '',
  jiraProjectCustomFieldLabel: '',

  analysisPluginShowOnTypes: [],
  analysisPluginExcludeTypes: [],
  analysisPluginSparqlDataQuery: '',
  analysisPluginCategories: {},
  analysisPluginTypes: [],
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
