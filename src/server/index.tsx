import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as promBundle from 'express-prom-bundle';
import Helmet from 'react-helmet';
import html from './html';
import setUpDeltaProxy from './proxy';
import silentRefreshHtml from './silent_refresh';
import { RootState } from '../shared/store/reducers';
import { DEFAULT_UI_SETTINGS } from '../shared/store/reducers/ui-settings';
import {
  DEFAULT_SEARCH_CONFIG_PROJECT,
  DEFAULT_SERVICE_ACCOUNTS_REALM,
} from '../shared/store/reducers/config';
import { DEFAULT_SEARCH_STATE } from '../shared/store/reducers/search';

const PORT_NUMBER = 8000;

// Create a express app
const app: express.Express = express();
const rawBase: string = process.env.BASE_PATH || '';

// to develop plugins locally, change PLUGINS_PATH to '/public/plugins'
const pluginsManifestPath =
  process.env.PLUGINS_MANIFEST_PATH || '/public/plugins';

// configure instance logo
const layoutSettings = {
  docsLink: process.env.DOCS_LINK || '',
  logoImg: process.env.LOGO_IMG || '',
  forgeLink: process.env.FORGE_LINK || '',
};

// configure search settings
const searchSettings = {
  searchConfigProject:
    process.env.SEARCH_CONFIG_PROJECT || DEFAULT_SEARCH_CONFIG_PROJECT,
};

// configure datamodels projects
const dataModelsLocation = process.env.DATA_MODELS || '';

const subAppsManifestPath =
  process.env.SUB_APPS_MANIFEST_PATH || '/public/sub-apps';

// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// enable logs
app.use(morgan('dev'));
// expose status route
app.get(`${base}/status`, (req, res) => res.send('OK'));
// Prometheus
app.use(promBundle({ includeMethod: true, metricsPath: `${base}/metrics` }));
// parse cookies
app.use(cookieParser());
// server static assets from the /public directory
app.use(`${base}/public`, express.static(join(__dirname, 'public')));

// if in Dev mode, setup HMR and all the fancy stuff
if (process.env.NODE_ENV !== 'production') {
  const { setupDevEnvironment } = require('./dev');
  if (process.env.PROXY) {
    setUpDeltaProxy(app, process.env.API_ENDPOINT || '');
  }
  setupDevEnvironment(app);
}

// silent refresh
app.get(
  `${base}/silent_refresh`,
  (req: express.Request, res: express.Response) => {
    res.send(silentRefreshHtml());
  }
);

// For all routes
app.get('*', async (req: express.Request, res: express.Response) => {
  // Compute pre-loaded state
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
        : process.env.API_ENDPOINT || '',
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
    },
    uiSettings: DEFAULT_UI_SETTINGS,
    oidc: {
      user: undefined,
      isLoadingUser: false,
    },
    search: DEFAULT_SEARCH_STATE,
  };

  // render an HTML string of our app
  const body: string = '';

  // Compute header data
  const helmet = Helmet.renderStatic();
  res.send(html({ body, helmet, preloadedState }));
});

app.listen(PORT_NUMBER, () => {
  // tslint:disable-next-line:no-console
  console.log(`Nexus Web is listening on a port ${PORT_NUMBER} ...`);
});

export default app;
