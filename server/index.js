// //e.g server.js
// import express from "express";
// import path from "path";

// import ViteExpress from "vite-express";
// import { fileURLToPath } from 'url';


// const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const isProduction = process.env.NODE_ENV === 'production';




// let templateHtml = path.join(__dirname, './index.html');
// // app.use(ViteExpress.static(path.join(__dirname, "public")));

// // function transformer(html, req) {
// //   console.log('@@req', req)
// //   return html.replace(
// //     "<!-- placeholder -->",
// //     `<meta name="custom" content="${req.baseUrl}"/>`
// //   )
// // }
// // const base = process.env.BASE || '/'
// // let vite
// // if (!isProduction) {
// //   const { createServer } = await import('vite')
// //   vite = await createServer({
// //     server: { middlewareMode: true },
// //     appType: 'custom',
// //     base
// //   })
// //   app.use(vite.middlewares)
// // } else {
// //   const compression = (await import('compression')).default
// //   const sirv = (await import('sirv')).default
// //   app.use(compression())
// //   app.use(base, sirv('./fuison-build/client', { extensions: [] }))
// // }

// app.get('*', async (req, res) => {
//   // const url = req.originalUrl.replace(base, '')
//   // let template
//   // let render
//   // if (!isProduction) {
//   //   // Always read fresh template in development
//   //   template = fs.readFileSync('./index.html', { encoding: 'utf-8' })
//   //   template = await vite.transformIndexHtml(url, template)
//   // } else {
//   //   template = templateHtml
//   // }

//   // const html = template
//   //   .replace(`<!--app-html-->`, template ?? '');
//   // // .replace(`<!--app-head-->`, rendered.head ?? '')

//   // const url = req.originalUrl.replace(base, '');
//   // res.status(200).set({ 'Content-Type': 'text/html' }).end(templateHtml)
//   if (!isProduction) {
//     return res.sendFile(templateHtml);
//   } else {
//     const compression = (await import('compression')).default
//     const sirv = (await import('sirv')).default
//     app.use(compression())
//     app.use('/', sirv('./fusion-build', { extensions: [] }))
//     return res.sendFile(templateHtml);
//   }

// });


// // ViteExpress.config({ transformer })
// ViteExpress.listen(app, 4000, () => console.log("Server is listening..."));


import express from "express";
import ViteExpress from "vite-express";

import {
  DEFAULT_ANALYSIS_DATA_SPARQL_QUERY,
  DEFAULT_REPORT_CATEGORIES,
  DEFAULT_REPORT_TYPES,
} from './constants.js';

const DEFAULT_SEARCH_CONFIG_PROJECT = 'webapps/nexus-web';
const DEFAULT_SERVICE_ACCOUNTS_REALM = 'serviceaccounts';
const app = express();
const rawBase = process.env.BASE_PATH || '';

// to develop plugins locally, change PLUGINS_PATH to '/public/plugins'
const pluginsManifestPath =
  process.env.PLUGINS_MANIFEST_PATH || '/public/plugins';

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
  process.env.SUB_APPS_MANIFEST_PATH || '/public/sub-apps';

const base = rawBase.replace(/\/$/, '');

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});


function transformer(html, req) {
  const preloadedState = {
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
    uiSettings:  {
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
  };
  return html.replace(
    '<!--app-state-->',
    `<script>
      window.__BASE__ = '/';
      // WARNING: See the following for security issues around embedding JSON in HTML:
      // http://redux.js.org/recipes/ServerRendering.html#security-considerations
      window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
      /</g,
      '\\u003c'
    )};
    </script>`
  )
}

ViteExpress.config({ transformer })

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
