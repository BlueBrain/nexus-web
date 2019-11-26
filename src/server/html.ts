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
      ${
        process.env.NODE_ENV !== 'production'
          ? ''
          : `<link rel="stylesheet" href="${base}public/bundle.css" />`
      }
      ${
        process.env.GTAG
          ? `<!-- Global site tag (gtag.js) - Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=${process.env.GTAG}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.GTAG}');
      </script>`
          : ''
      }
      
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <base href="${base}" />
    </head>
    <body ${helmet.bodyAttributes.toString()}>
      <div id="app">${body}</div>
      <script>
        window.__BASE__ = '${base}';
        // WARNING: See the following for security issues around embedding JSON in HTML:
        // http://redux.js.org/recipes/ServerRendering.html#security-considerations
        window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
          /</g,
          '\\u003c'
        )};
      </script>
      <script src="${base}public/bundle.js" defer></script>
    </body>
  </html>
`;

export default html;
