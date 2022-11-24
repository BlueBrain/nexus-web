import { ConfigActions } from '../actions/config';
export declare const DEFAULT_SEARCH_CONFIG_PROJECT = 'webapps/nexus-web';
export declare const DEFAULT_SERVICE_ACCOUNTS_REALM = 'serviceaccounts';
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
    forgeLink: string;
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
    [resourceType: string]: {
      label: string;
      description: string;
    }[];
  };
  analysisPluginTypes: {
    label: string;
    description: string;
  }[];
  httpHeaderForInaccessibleDueToVPN?: string;
}
export default function configReducer(
  state: ConfigState | undefined,
  action: ConfigActions
): ConfigState;
