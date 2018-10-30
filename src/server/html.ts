import { HelmetData } from 'react-helmet';

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
      <link rel="stylesheet" href="/public/bundle.css" />
      <base href="/" />
    </head>
    <body ${helmet.bodyAttributes.toString()}>
      <div id="app">${body}</div>
    </body>
    <script src="/public/bundle.js" defer></script>
  </html>
`;

export default html;
