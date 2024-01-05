import { Request } from 'express';

export const DEFAULT_SCALE = 50;

export const DEFAULT_REPORT_TYPES = [
  {
    label: 'Analysis',
    description:
      'Any other report that is neither "Validation" not "Prediction".',
  },
  {
    label: 'Validation',
    description:
      'A report that compares a property against a target value that is derived from experimental data.',
  },
];

export const DEFAULT_REPORT_CATEGORIES = {
  DetailedCircuit: [
    {
      label: 'Anatomical',
      description:
        'A report relating to the cellular contents and placement of the circuit. For example, to neurons and the locations of their somata or dendrites.',
    },
    {
      label: 'Connectivity',
      description:
        'A report relating to the structure and topology of synaptic connections, analyzing the underlying directed connectivity graph.',
    },
    {
      label: 'Volumetric',
      description:
        'A report that explicitly considers the volume and/or shape of the modeled space. For example, the density of dendrites of synapses within a cubic volume.',
    },
    {
      label: 'Morphometric',
      description:
        'A report relating to the shape or morphology of the cells in the circuit. For example, counting the number of dendrite bifurcations.',
    },
    {
      label: 'Synapse',
      description:
        'A report relating to properties of synaptic connections. Unlike Connectivity it does not reduce them to a graph and instead considers properties of individual synapses, such as their dendritic locations or physiological parameters',
    },
  ],
  SimulationCampaignConfiguration: [
    {
      label: 'Spiking',
      description:
        'An analysis report based on the spiking activity of the simulated neurons.',
    },
    {
      label: 'Soma voltage',
      description:
        'An analysis report based on the (subthreshold) soma voltage traces of the simulated neurons.',
    },
    {
      label: 'LFP',
      description:
        'An analysis report based on traces of extracellular potential calculated from the simulations.',
    },
    {
      label: 'VSD',
      description:
        'An analysis report based on predicted VSD images calculated from the simulations.',
    },
    {
      label: 'Plasticity',
      description:
        'An analysis report based on the temporal evolution of plasticity-related synapse parameters.',
    },
  ],
};

export const DEFAULT_ANALYSIS_DATA_SPARQL_QUERY = `PREFIX s:<http://schema.org/>
PREFIX prov:<http://www.w3.org/ns/prov#>
PREFIX nsg:<https://neuroshapes.org/>
PREFIX nxv:<https://bluebrain.github.io/nexus/vocabulary/>
SELECT ?container_resource_id  ?container_resource_name ?analysis_report_id ?analysis_report_name ?analysis_report_description ?analysis_report_categories ?analysis_report_types ?created_by ?created_at ?updated_by ?updated_at ?self
WHERE {
  OPTIONAL {
    BIND(<{resourceId}> as ?container_resource_id) .
    BIND(<{resourceId}> as ?self) .
    ?derivation_id        ^prov:derivation       ?analysis_report_id .
    ?derivation_id        nsg:entity             ?container_resource_id .
    OPTIONAL {
      ?container_resource_id        nsg:name                   ?container_resource_name .
    }
    ?analysis_report_id    nsg:name            ?analysis_report_name .
    ?analysis_report_id    nsg:description       ?analysis_report_description .
    OPTIONAL {
      ?analysis_report_id    nsg:categories       ?analysis_report_categories .
      ?analysis_report_id    nsg:types       ?analysis_report_types .
    }
    ?analysis_report_id nxv:createdBy ?created_by .
    ?analysis_report_id nxv:createdAt ?created_at .
    ?analysis_report_id nxv:updatedBy ?updated_by .
    ?analysis_report_id nxv:updatedAt ?updated_at .
  }
  OPTIONAL {
    BIND(<{resourceId}> as ?analysis_report_id) .
    BIND(<{resourceId}> as ?self) .
    ?derivation_id        ^prov:derivation       ?analysis_report_id .
    ?derivation_id        nsg:entity             ?container_resource_id .
    OPTIONAL {
      ?container_resource_id        nsg:name                   ?container_resource_name .
    }
    ?analysis_report_id    nsg:name            ?analysis_report_name .
    ?analysis_report_id    nsg:description       ?analysis_report_description .
    OPTIONAL {
      ?analysis_report_id    nsg:categories       ?analysis_report_categories .
      ?analysis_report_id    nsg:types       ?analysis_report_types .
    }
    ?analysis_report_id nxv:createdBy ?created_by .
    ?analysis_report_id nxv:createdAt ?created_at .
    ?analysis_report_id nxv:updatedBy ?updated_by .
    ?analysis_report_id nxv:updatedAt ?updated_at .
  }
}
LIMIT 1000`;

const DEFAULT_SEARCH_CONFIG_PROJECT = 'webapps/nexus-web';
const DEFAULT_SERVICE_ACCOUNTS_REALM = 'serviceaccounts';
const rawBase = process.env.BASE_PATH || '';
const pluginsManifestPath = process.env.PLUGINS_MANIFEST_PATH || `dist/plugins`;

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
  searchConfigProject:
    process.env.SEARCH_CONFIG_PROJECT || DEFAULT_SEARCH_CONFIG_PROJECT,
};

// configure datamodels projects
const dataModelsLocation = process.env.DATA_MODELS || '';

const subAppsManifestPath =
  process.env.SUB_APPS_MANIFEST_PATH || '/dist/sub-apps';

const base = rawBase.replace(/\/$/, '');

type TMode = 'production' | 'development';

const gePreloadedState = ({ req, mode }: { req: Request; mode: TMode }) => ({
  auth: {},
  config: {
    searchSettings,
    layoutSettings,
    pluginsManifestPath,
    subAppsManifestPath,
    dataModelsLocation,
    mode: mode,
    apiEndpoint: process.env.PROXY ? '/proxy' : process.env.API_ENDPOINT || '',
    basePath: base,
    clientId: process.env.CLIENT_ID || 'bbp-nise-dev-nexus-fusion',
    redirectHostName: `${process.env.HOST_NAME ||
      `${req.protocol}://${req.headers.host}`}${base}`,
    serviceAccountsRealm:
      process.env.SERVICE_ACCOUNTS_REALM || DEFAULT_SERVICE_ACCOUNTS_REALM,
    sentryDsn: process.env.SENTRY_DSN,
    gtmCode: process.env.GTM_CODE,
    studioView: process.env.STUDIO_VIEW || '',
    jiraUrl: process.env.JIRA_URL || '',
    jiraResourceCustomFieldName: process.env.JIRA_RESOURCE_FIELD_NAME || '',
    jiraResourceCustomFieldLabel:
      process.env.JIRA_RESOURCE_FIELD_LABEL || 'Nexus Resource',
    jiraProjectCustomFieldName: process.env.JIRA_PROJECT_FIELD_NAME || '',
    jiraProjectCustomFieldLabel:
      process.env.JIRA_PROJECT_FIELD_LABEL || 'Nexus Project',
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
      process.env.ANALYSIS_PLUGIN_SPARQL_DATA_QUERY ||
      DEFAULT_ANALYSIS_DATA_SPARQL_QUERY,
    analysisPluginCategories: process.env.ANALYSIS_PLUGIN_CATEGORIES
      ? JSON.parse(process.env.ANALYSIS_PLUGIN_CATEGORIES)
      : DEFAULT_REPORT_CATEGORIES,
    analysisPluginTypes: process.env.ANALYSIS_PLUGIN_TYPES
      ? JSON.parse(process.env.ANALYSIS_PLUGIN_TYPES)
      : DEFAULT_REPORT_TYPES,
    httpHeaderForInaccessibleDueToVPN:
      process.env.HTTP_HEADER_WHERE_INACCESSIBLE_OUTSIDE_OF_VPN ||
      'x-requires-vpn',
  },
  uiSettings: {
    openCreationPanel: false,
    pageSizes: {
      orgsListPageSize: 5,
      projectsListPageSize: 5,
      resourcesListPageSize: 20,
      linksListPageSize: 10,
    },
    currentResourceView: null,
    isAdvancedModeEnabled: false,
  },
  oidc: {
    user: undefined,
    isLoadingUser: false,
  },
  search: {
    searchConfigs: {
      isFetching: false,
      data: null,
      error: null,
    },
    searchPreference: null,
  },
  modals: {
    isCreateOrganizationModelVisible: false,
    isCreateProjectModelVisible: false,
    isCreateStudioModelVisible: false,
    isAboutModelVisible: false,
  },
  dataExplorer: {
    current: null,
    leftNodes: { links: [], shrinked: false },
    rightNodes: { links: [], shrinked: false },
    fullscreen: false,
    origin: '',
  },
});

export { base, gePreloadedState };
