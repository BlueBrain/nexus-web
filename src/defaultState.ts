import { RootState } from 'shared/store/reducers';
import {
  DEFAULT_SEARCH_CONFIG_PROJECT,
  DEFAULT_SERVICE_ACCOUNTS_REALM,
} from 'shared/store/reducers/config';
import { DEFAULT_MODALS_STATE } from 'shared/store/reducers/modals';
import { DEFAULT_SEARCH_STATE } from 'shared/store/reducers/search';
import { DEFAULT_UI_SETTINGS } from 'shared/store/reducers/ui-settings';

import {
  DEFAULT_ANALYSIS_DATA_SPARQL_QUERY,
  DEFAULT_REPORT_CATEGORIES,
  DEFAULT_REPORT_TYPES,
} from './constants';
const rawBase: string = process.env.BASE_PATH || '';

const subAppsManifestPath = process.env.SUB_APPS_MANIFEST_PATH || '/public/sub-apps';
// to develop plugins locally, change PLUGINS_PATH to '/public/plugins'
const pluginsManifestPath = process.env.PLUGINS_MANIFEST_PATH || '/public/plugins';

// configure instance logo
const layoutSettings = {
  docsLink: process.env.DOCS_LINK || '',
  logoImg: process.env.LOGO_IMG || '',
  forgeLink: process.env.FORGE_LINK || '',
  organizationImg: process.env.ORGANIZATION_IMG || '',
  projectsImg: process.env.PROJECTS_IMG || '',
  studiosImg: process.env.STUDIOS_IMG || '',
  projectImg: process.env.PROJECT_IMG || '',
  landingVideo: process.env.LANDING_VIDEO || '',
  landingPosterImg: process.env.LANDING_POSTER_IMG || '',
  mainColor: process.env.MAIN_COLOR || '#062d68',
};

// configure search settings
const searchSettings = {
  searchConfigProject: process.env.SEARCH_CONFIG_PROJECT || DEFAULT_SEARCH_CONFIG_PROJECT,
};
const dataModelsLocation = process.env.DATA_MODELS || '';
const base: string = rawBase.replace(/\/$/, '');

const preloadedState: RootState = {
  auth: {},
  config: {
    searchSettings,
    layoutSettings,
    pluginsManifestPath,
    subAppsManifestPath,
    dataModelsLocation,
    apiEndpoint: process.env.PROXY
      ? '/proxy'
      : process.env.API_ENDPOINT || 'https://bbp.epfl.ch/nexus/v1',
    basePath: base,
    clientId: process.env.CLIENT_ID || 'bbp-nise-dev-nexus-fusion',
    redirectHostName: '/',
    serviceAccountsRealm: process.env.SERVICE_ACCOUNTS_REALM || DEFAULT_SERVICE_ACCOUNTS_REALM,
    sentryDsn: process.env.SENTRY_DSN,
    gtmCode: process.env.GTM_CODE,
    studioView: process.env.STUDIO_VIEW || '',
    jiraUrl: process.env.JIRA_URL || '',
    jiraResourceCustomFieldName: process.env.JIRA_RESOURCE_FIELD_NAME || '',
    jiraResourceCustomFieldLabel: process.env.JIRA_RESOURCE_FIELD_LABEL || 'Nexus Resource',
    jiraProjectCustomFieldName: process.env.JIRA_PROJECT_FIELD_NAME || '',
    jiraProjectCustomFieldLabel: process.env.JIRA_PROJECT_FIELD_LABEL || 'Nexus Project',
    ...(process.env.JIRA_SUPPORTED_REALMS && {
      jiraSupportedRealms: process.env.JIRA_SUPPORTED_REALMS.split(','),
    }),
    analysisPluginShowOnTypes: process.env.ANALYSIS_PLUGIN_SHOW_ON_TYPES
      ? process.env.ANALYSIS_PLUGIN_SHOW_ON_TYPES.split(',')
      : [],
    analysisPluginExcludeTypes: process.env.ANALYSIS_PLUGIN_EXCLUDE_TYPES
      ? process.env.ANALYSIS_PLUGIN_EXCLUDE_TYPES.split(',')
      : [],
    analysisPluginSparqlDataQuery:
      process.env.ANALYSIS_PLUGIN_SPARQL_DATA_QUERY || DEFAULT_ANALYSIS_DATA_SPARQL_QUERY,
    analysisPluginCategories: process.env.ANALYSIS_PLUGIN_CATEGORIES
      ? JSON.parse(process.env.ANALYSIS_PLUGIN_CATEGORIES)
      : DEFAULT_REPORT_CATEGORIES,
    analysisPluginTypes: process.env.ANALYSIS_PLUGIN_TYPES
      ? JSON.parse(process.env.ANALYSIS_PLUGIN_TYPES)
      : DEFAULT_REPORT_TYPES,
    httpHeaderForInaccessibleDueToVPN:
      process.env.HTTP_HEADER_WHERE_INACCESSIBLE_OUTSIDE_OF_VPN || 'x-requires-vpn',
  },
  uiSettings: DEFAULT_UI_SETTINGS,
  oidc: {
    user: undefined,
    isLoadingUser: false,
  },
  search: DEFAULT_SEARCH_STATE,
  modals: DEFAULT_MODALS_STATE,
  dataExplorer: {
    current: null,
    leftNodes: { links: [], shrinked: false },
    rightNodes: { links: [], shrinked: false },
    fullscreen: false,
    origin: '',
  },
};

export default preloadedState;
