
import express from "express";
import ViteExpress from "vite-express";
import pc from "picocolors";
import path from 'path';
import fs from 'fs';
import { Helmet } from 'react-helmet';
import compression from 'compression';
import {
  DEFAULT_ANALYSIS_DATA_SPARQL_QUERY,
  DEFAULT_REPORT_CATEGORIES,
  DEFAULT_REPORT_TYPES,
} from './constants.js';


process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8000;

const DEFAULT_SEARCH_CONFIG_PROJECT = 'webapps/nexus-web';
const DEFAULT_SERVICE_ACCOUNTS_REALM = 'serviceaccounts';
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

const app = express();
app.use(compression());

app.get("/health", (_, res) => {
  return res.send("100% running");
});

const Config = {
  mode: (NODE_ENV === "production" ? "production" : "development")
};

async function startServer(server) {
  const { createServer } = await import("vite");

  const vite = await createServer({
    clearScreen: false,
    appType: "custom",
    server: { middlewareMode: true },
  });

  server.on("close", () => vite.close());

  return vite;
}

function resolveConfig() {
  const root = process.cwd();
  const base = "/";
  const build = { outDir: "dist", refreshOutDir: 'dist_refresh' };

  return { root, base, build };
}

function getDistPath() {
  const config = resolveConfig();
  return {
    dist: path.resolve(config.root, config.build.outDir),
    dist_refresh: path.resolve(config.root, config.build.refreshOutDir),
  };
}

async function serveStatic() {
  const distPath = getDistPath().dist;

  if (!fs.existsSync(distPath)) {
    console.info(`${pc.red(`Static files at ${pc.gray(distPath)} not found!`)}`);
    console.info(
      `${pc.yellow(
        `Did you forget to run ${pc.bold(pc.green("vite build"))} command?`
      )}`
    );
  } else {
    console.info(`${pc.green(`Serving static files from ${pc.gray(distPath)}`)}`);
  }

  return express.static(distPath, { index: false });
}

const stubMiddleware = (req, res, next) => next();

async function injectStaticMiddleware(
  app,
  middleware,
) {
  const config = await resolveConfig();
  const base = config.base || "/";
  app.use(base, middleware);

  const stubMiddlewareLayer = app._router.stack.find(
    ({ handle }) => handle === stubMiddleware
  );

  if (stubMiddlewareLayer !== undefined) {
    const serveStaticLayer = app._router.stack.pop();
    app._router.stack = app._router.stack.map((layer) => {
      return layer === stubMiddlewareLayer ? serveStaticLayer : layer;
    });
  }
}

async function transformer(html, req) {
  const realms = await ((await fetch(`${process.env.API_ENDPOINT}/realms`))).json().catch((error) => {
    console.error('[ERROR] Fetch Realms Server Side', error);
  });
  const preloadedState = {
    auth: {
      realms: { data: realms },
      identities: { data: null }
    },
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
  };
  const helmet = Helmet.renderStatic();
  const regexBody = /<body(.*?)/gi;
  const bodyTag = `<body ${helmet.bodyAttributes.toString()}`;
  const regexHtml = /<html(.*?)/gi;
  const htmlTag = `<html ${helmet.htmlAttributes.toString()}`;
  let dom = html
    .replace(regexHtml, htmlTag)
    .replace(regexBody, bodyTag)
    .replace('<!--app-head-->',
      `
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
      `
    )
    .replace(
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
    );

  return dom;
}

function isStaticFilePath(path) {
  return path.match(/(\.\w+$)|@vite|@id|@react-refresh/);
}

async function injectDevIndexMiddleware(
  app,
  server,
) {
  const config = await resolveConfig();
  app.get(
    `${base}/silent_refresh`,
    (req, res) => {
      const distPath = getDistPath().dist_refresh;
      const html = fs.readFileSync(path.join(distPath, "/silent_refresh/silent_refresh.html"), "utf-8");
      return res.send(html);
    }
  );
  app.get("/*", async (req, res, next) => {
    const template = fs.readFileSync(
      path.resolve(config.root, "index.html"),
      "utf8"
    );

    if (isStaticFilePath(req.path)) next();
    else {
      const html = await server.transformIndexHtml(req.originalUrl, template);
      const dom = await transformer(html, req);
      return res.send(dom);
    }
  });
}

async function injectProdIndexMiddleware(app) {
  const distPath = getDistPath();
  app.get(
    `${base}/silent_refresh`,
    (req, res) => {
      const distPath = getDistPath();
      const html = fs.readFileSync(path.join(distPath.dist_refresh, "/silent_refresh/silent_refresh.html"), "utf-8");
      res.send(html);
    }
  );
  app.use("*", async (req, res) => {
    const html = fs.readFileSync(path.resolve(distPath.dist, "index.html"), "utf-8");
    const dom = await transformer(html, req);
    return res.send(dom);
  });
}

async function bind(
  app,
  server,
  callback
) {
  if (Config.mode === "development") {
    console.info(`Fusion is up an running (development) ${PORT}`)
    const vite = await startServer(server);
    await injectStaticMiddleware(app, vite.middlewares);
    await injectDevIndexMiddleware(app, vite);
    return;
  } else {
    console.info(`Fusion is up an running (production) ${PORT}`)
    await injectStaticMiddleware(app, await serveStatic());
    await injectProdIndexMiddleware(app);
    return;
  }
}

function listen(app, port, callback) {
  const server = app.listen(port, () => bind(app, server, callback));
  return server;
}


listen(app, PORT);



