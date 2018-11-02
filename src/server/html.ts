import { HelmetData } from 'react-helmet';

const base: string = process.env.BASE_PATH || '/';

/**
 *
 * @param body
 * @returns string The HTML document
 */
const html = ({ body, helmet }: { body: string, helmet: HelmetData }): string => `
  <!doctype html>
  <html ${helmet.htmlAttributes.toString()}>
    <head>
      ${helmet.title.toString()}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
      <link rel="stylesheet" href="${base}public/bundle.css" />
      <base href="${base}" />
    </head>
    <body ${helmet.bodyAttributes.toString()}>
      <div id="app">${body}</div>
      <script>
        window.__BASE__ = '${base}';
      </script>
    </body>
    <script src="${base}public/bundle.js" defer></script>
  </html>
`;

export default html;
