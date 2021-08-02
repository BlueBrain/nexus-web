import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as promBundle from 'express-prom-bundle';
import Helmet from 'react-helmet';
import html from './html';
import silentRefreshHtml from './silent_refresh';
import { RootState } from '../shared/store/reducers';
import { DEFAULT_UI_SETTINGS } from '../shared/store/reducers/ui-settings';
import { DEFAULT_SEARCH_CONFIG_PROJECT } from '../shared/store/reducers/config';
import { DEFAULT_SEARCH_STATE } from '../shared/store/reducers/search';
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT_NUMBER = 8000;

// Create a express app
const app: express.Express = express();
const rawBase: string = process.env.BASE_PATH || '';

// to develop plugins locally, change PLUGINS_PATH to '/public/plugins'
const pluginsManifestPath =
  process.env.PLUGINS_MANIFEST_PATH || '/public/plugins';

// configure instance logo
const layoutSettings = {
  logoImg: process.env.LOGO_IMG || '',
  logoLink: process.env.LOGO_LINK || 'https://bluebrainnexus.io/',
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
  setupDevEnvironment(app);

  // setUpProxyForSearch();
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
      apiEndpoint: process.env.API_ENDPOINT || '',
      basePath: base,
      clientId: process.env.CLIENT_ID || 'nexus-web',
      redirectHostName: `${process.env.HOST_NAME ||
        `${req.protocol}://${req.headers.host}`}${base}`,
      sentryDsn: process.env.SENTRY_DSN,
      gtmCode: process.env.GTM_CODE,
      studioView: process.env.STUDIO_VIEW || '',
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

function setUpProxyForSearch() {
  const esResult = {
    hits: {
      hits: [
        {
          _type: '_doc',
          sort: [1627390182151],
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/d52e34bd-5f62-495a-9e5c-b2d3afa33017',
          _index: 'delta_3c07805d-0818-4eaf-8af4-91daa452268d_2',
          _source: {
            project: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'Project',
            },
            '@type': ['a', 'b', 'c', 'd'],
            name: 'A Resource',
            description: 'Description',
            subjectSpecies: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'Subject Species',
            },
            brainRegion: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'Brain Region',
            },
            contributors: [
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'James Bond',
              },
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'Jason Bourne',
              },
            ],
            organisations: [
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'MI6',
              },
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'CIA',
              },
            ],
            license: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'License to Kill',
            },
            mType: [
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'mType1',
              },
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'mType2',
              },
            ],
          },
        },
      ],
      max_score: 0.03460473,
      total: {
        relation: 'eq',
        value: 115739,
      },
    },
    timed_out: false,
    took: 8,
    _shards: {
      failed: 0,
      skipped: 0,
      successful: 1,
      total: 1,
    },
  };

  type SearchConfig = {
    fields: (
      | {
          name: string;
          label: string;
          array: boolean;
          fields: { name: string; format: string }[];
          format?: undefined;
        }
      | {
          name: string;
          label: string;
          format: string;
          array: boolean;
          fields?: undefined;
        }
    )[];
  };

  const searchConfig: SearchConfig = {
    fields: [
      {
        name: 'project',
        label: 'Project',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: '@type',
        label: 'Types',
        format: 'uri',
        array: true,
      },
      {
        name: 'name',
        label: 'Name',
        array: false,
        format: 'text',
      },
      {
        name: 'description',
        label: 'Description',
        array: false,
        format: 'text',
      },
      {
        name: 'brainRegion',
        label: 'Brain Region',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'subjectSpecies',
        label: 'Subject Species',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'contributors',
        label: 'Contributors',
        array: true,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'organisations',
        label: 'Organisations',
        array: true,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'license',
        label: 'License',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'mType',
        label: 'M-Type',
        array: true,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
    ],
  };

  const filter = function(pathname: string, req: express.Request) {
    console.log(`${req.method} ${pathname}`);
    const query =
      pathname.match('^/proxy/search/query') && req.method === 'POST';
    const config =
      pathname.match('^/proxy/search/config') && req.method === 'GET';
    if (query || config) {
      return false;
    }
    return true;
  };

  app.use(
    '/proxy',
    createProxyMiddleware(filter, {
      target: process.env.API_ENDPOINT,
      changeOrigin: true,
      pathRewrite: {
        [`^/proxy`]: '',
      },
    })
  );
  // search proxy
  app.get(
    `/proxy/search/config`,
    (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(searchConfig));
    }
  );

  // search query
  app.post(
    `/proxy/search/query`,
    (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(esResult));
    }
  );
}
