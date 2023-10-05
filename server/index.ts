import path from 'path';
import fs from 'fs';
import compression from 'compression';
import express, { Express, Request, Response, NextFunction } from 'express';

import { Server } from 'http';
import { ViteDevServer } from 'vite';
import { Helmet } from 'react-helmet';
import { base, gePreloadedState } from './constants';

const NODE_ENV = process.env.NODE_ENV;
const DISABLE_SSL = process.env.DISABLE_SSL;
const PORT = Number(process.env.PORT) || 8000;
// @ts-ignore
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = DISABLE_SSL;
const mode = NODE_ENV === 'production' ? 'production' : 'development';

const app = express();
app.use(compression());

async function startServer(server: Server) {
  const { createServer } = await import('vite');

  const vite = await createServer({
    clearScreen: false,
    appType: 'custom',
    server: { middlewareMode: true },
  });

  server.on('close', () => vite.close());

  return vite;
}

function resolveConfig() {
  const root = process.cwd();
  const base = '/';
  const build = { outDir: 'dist', refreshOutDir: 'dist_refresh' };

  return { root, base, build };
}

function getDistPath() {
  const config = resolveConfig();
  return {
    dist: path.resolve(config.root, config.build.outDir),
    dist_refresh: path.resolve(config.root, config.build.refreshOutDir),
  };
}

function serveStatic() {
  const distPath = getDistPath().dist;

  if (!fs.existsSync(distPath)) {
    console.info(`Static files at ${distPath} not found!`);
    console.info(`Did you forget to run 'vite build' command?`);
  } else {
    console.info(`Serving static files from ${distPath}`);
  }

  return express.static(distPath, { index: false });
}

const stubMiddleware = (_req: Request, _res: Response, next: NextFunction) =>
  next();

async function injectStaticMiddleware(app: express.Express, middleware: any) {
  const config = resolveConfig();
  const base = config.base || '/';
  app.use(base, middleware);

  const stubMiddlewareLayer = app._router.stack.find(
    ({ handle }: { handle: any }) => handle === stubMiddleware
  );

  if (stubMiddlewareLayer !== undefined) {
    const serveStaticLayer = app._router.stack.pop();
    app._router.stack = app._router.stack.map((layer: any) => {
      return layer === stubMiddlewareLayer ? serveStaticLayer : layer;
    });
  }
}

async function transformer(html: string, req: Request) {
  const helmet = Helmet.renderStatic();
  const preloadedState = gePreloadedState({ req, mode });

  const regexBody = /<body(.*?)/gi;
  const bodyTag = `<body ${helmet.bodyAttributes.toString()}`;
  const regexHtml = /<html(.*?)/gi;
  const htmlTag = `<html ${helmet.htmlAttributes.toString()}`;

  let dom = html
    .replace(regexHtml, htmlTag)
    .replace(regexBody, bodyTag)
    .replace(
      '<!--app-head-->',
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
    )
    .replace(
      '<!--scripts-->',
      `
        <script src="https://www.unpkg.com/systemjs@6.1.7/dist/system.js"></script>
        <script src="https://www.unpkg.com/systemjs@6.1.7/dist/extras/named-exports.js"></script>
        <script type="systemjs-importmap">
        {
          "imports": {
            "react": "https://unpkg.com/react@18.2.0/umd/react.production.min.js",
            "react-dom": "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"
          }
        }
      </script>
    `
    );

  return dom;
}

async function injectDevIndexMiddleware(app: Express, server: ViteDevServer) {
  const config = resolveConfig();
  app.get(`${base}/silent_refresh`, (_: Request, res: Response) => {
    const distPath = getDistPath().dist_refresh;
    const html = fs.readFileSync(
      path.join(distPath, '/silent_refresh/silent_refresh.html'),
      'utf-8'
    );
    return res.send(html);
  });
  app.get('/*', async (req: Request, res: Response) => {
    const template = fs.readFileSync(
      path.resolve(config.root, 'index.html'),
      'utf8'
    );

    const html = await server.transformIndexHtml(req.originalUrl, template);
    const dom = await transformer(html, req);
    return res.send(dom);
  });
}

async function injectProdIndexMiddleware(app: Express) {
  const distPath = getDistPath();
  app.get(`${base}/silent_refresh`, (_: Request, res: Response) => {
    const distPath = getDistPath();
    const html = fs.readFileSync(
      path.join(distPath.dist_refresh, '/silent_refresh/silent_refresh.html'),
      'utf-8'
    );
    res.send(html);
  });
  app.use('*', async (req: Request, res: Response) => {
    const html = fs.readFileSync(
      path.resolve(distPath.dist, 'index.html'),
      'utf-8'
    );
    const dom = await transformer(html, req);
    return res.send(dom);
  });
}

app.get('/health', (_, res) => {
  return res.send('100% running');
});

async function bind(app: Express, server: Server) {
  if (mode === 'development') {
    console.info(`Fusion is up an running (development) ${PORT}`);
    const vite = await startServer(server);
    await injectStaticMiddleware(app, vite.middlewares);
    await injectDevIndexMiddleware(app, vite);
    return;
  } else {
    console.info(`Fusion is up an running (production) ${PORT}`);
    await injectStaticMiddleware(app, await serveStatic());
    await injectProdIndexMiddleware(app);
    return;
  }
}

function listen(app: Express, port: number) {
  const server: Server = app.listen(port, () => bind(app, server));
  return server;
}

listen(app, PORT);
