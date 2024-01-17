import path from 'node:path';
import fs from 'node:fs';
import { Server } from 'node:http';
import compression from 'compression';
import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { ViteDevServer } from 'vite';
import { Helmet } from 'react-helmet';
import { base, getPreloadedState } from './constants';

const NODE_ENV = process.env.NODE_ENV;
const DISABLE_SSL = process.env.DISABLE_SSL;
const PORT = Number(process.env.PORT) || 8000;
// @ts-ignore
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = DISABLE_SSL;
const mode = NODE_ENV === 'production' ? 'production' : 'development';
const __dirname = new URL('.', import.meta.url).pathname;

const app = express();
app.use(compression());
app.use(morgan('common'));

async function startServer(server: Server) {
  const { createServer } = await import('vite');

  const vite = await createServer({
    clearScreen: false,
    appType: 'custom',
    server: {
      middlewareMode: true,
    },
  });

  server.on('close', () => vite.close());

  return vite;
}

function resolveConfig() {
  const root = process.cwd();
  const build = { outDir: 'dist' };

  return { root, build };
}

function getDistPath() {
  const { root, build } = resolveConfig();
  return path.resolve(root, build.outDir);
}

function serveStatic() {
  const distPath = getDistPath();

  if (!fs.existsSync(distPath)) {
    console.info(`Static files at ${distPath} not found!`);
    console.info(`Did you forget to run 'vite build' command?`);
  } else {
    console.info(`Serving static files from ${distPath}`);
  }

  return express.static(path.join(__dirname), { index: false });
}

const stubMiddleware = (_req: Request, _res: Response, next: NextFunction) =>
  next();

async function injectStaticMiddleware(app: express.Express, middleware: any) {
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
  const preloadedState = getPreloadedState({ req, mode });

  const regexBody = /<body(.*?)/gi;
  const bodyTag = `<body ${helmet.bodyAttributes.toString()}`;
  const regexHtml = /<html(.*?)/gi;
  const htmlTag = `<html ${helmet.htmlAttributes.toString()}`;
  let dom = html
    .replace(regexHtml, htmlTag)
    .replace(regexBody, bodyTag)
    .replace(
      '<!--app-manifest-->',
      `
      <link rel="icon" href="${base}/public/favicon.ico" sizes="48x48" >
      <link rel="icon" href="${base}/public/favicon.svg" sizes="any" type="image/svg+xml" >
      <link rel="apple-touch-icon" href="${base}/public/apple-touch-icon-180x180.png" >
      <link rel="manifest" href="${base}/web-manifest" >
      `
    )
    .replace(
      '<!--app-head-->',
      `
        <script>
          window.__BASE__ = '${base}'
        </script>
        <base href="${base}" />
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
      `
    )
    .replace(
      '<!--app-state-->',
      `<script>
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
  const { root } = resolveConfig();

  app.get(`${base}/silent_refresh`, (_: Request, res: Response) => {
    const distPath = getDistPath();
    const html = fs.readFileSync(
      path.join(distPath, '/silent_refresh/silent_refresh.html'),
      'utf-8'
    );
    return res.send(html);
  });

  app.get('/*', async (req: Request, res: Response) => {
    const template = fs.readFileSync(path.resolve(root, 'index.html'), 'utf8');

    const html = await server.transformIndexHtml(req.originalUrl, template);
    const dom = await transformer(html, req);
    return res.send(dom);
  });
}

async function injectProdIndexMiddleware(app: Express) {
  const distPath = getDistPath();

  app.get(`${base}/silent_refresh`, (_: Request, res: Response) => {
    const html = fs.readFileSync(
      path.join(__dirname, 'silent_refresh/silent_refresh.html'),
      'utf-8'
    );
    res.send(html);
  });

  app.use('*', async (req: Request, res: Response) => {
    const html = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
    const dom = await transformer(html, req);
    return res.send(dom);
  });
}

app.get(`${base}/status`, (_, res) => {
  return res.send('100% running');
});

app.get(`${base}/web-manifest`, (req, res) => {
  const host = req.get('host');
  const startUrl = `${
    NODE_ENV === 'development' ? req.protocol : 'https'
  }://${host}${base}`;

  const manifestTempalte = fs.readFileSync(
    path.join(
      __dirname,
      NODE_ENV === 'development' ? '../public' : '',
      'web-manifest.json'
    ),
    'utf-8'
  );

  const manifest = manifestTempalte.replace('<!--start-url-->', startUrl);

  res.header('content-type', 'application/json');
  return res.status(200).send(manifest);
});

async function bind(app: Express, server: Server) {
  if (mode === 'development') {
    console.info(
      `Fusion is up an running (development): http://localhost:${PORT}`
    );
    const vite = await startServer(server);
    await injectStaticMiddleware(app, vite.middlewares);
    await injectDevIndexMiddleware(app, vite);
    return;
  } else {
    console.info(`Fusion is up an running (production) ${PORT}`);
    await injectStaticMiddleware(app, serveStatic());
    await injectProdIndexMiddleware(app);
    return;
  }
}

function listen(app: Express, port: number) {
  const server: Server = app.listen(port, () => bind(app, server));
  return server;
}

listen(app, PORT);
