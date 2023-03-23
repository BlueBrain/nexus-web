import { HelmetData } from 'react-helmet';

const icon = require('../shared/favicon.png');
const base: string = process.env.BASE_PATH || '/';

/**
 *
 * @param body
 * @returns string The HTML document
 */
const html = ({
  body,
  helmet,
  preloadedState,
}: {
  body: string;
  helmet: HelmetData;
  preloadedState: object;
}): string => `
  <!doctype html>
  <html ${helmet.htmlAttributes.toString()}>
    <head>
      ${helmet.title.toString()}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
      <link rel="shortcut icon" type="image/png" href="${icon}"/>
      <script src="https://www.unpkg.com/systemjs@6.1.7/dist/system.js"></script>
      <script src="https://www.unpkg.com/systemjs@6.1.7/dist/extras/named-exports.js"></script>
      <script type="systemjs-importmap">
        {
          "imports": {
            "react": "https://unpkg.com/react@16.12.0/umd/react.production.min.js",
            "react-dom": "https://unpkg.com/react-dom@16.12.0/umd/react-dom.production.min.js"
          }
        }
      </script>
      ${
        process.env.NODE_ENV !== 'production'
          ? ''
          : `<link rel="stylesheet" href="${base}public/bundle.css" />`
      }
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <base href="${base}" />
    </head>
    <body ${helmet.bodyAttributes.toString()}>
      <div id="app" style="height:100%">${body}</div>
      <script>
        window.__BASE__ = '${base}';
        // WARNING: See the following for security issues around embedding JSON in HTML:
        // http://redux.js.org/recipes/ServerRendering.html#security-considerations
        window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
          /</g,
          '\\u003c'
        )};
      </script>
      <script src="${base}public/antd.js" ></script>
      <script src="${base}public/antv.js" ></script>
      <script src="${base}public/bundle.js" ></script>
    </body>
  </html>
`;

export default html;
