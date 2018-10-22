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
      <style>
        body {
          background-color: #ff6666;
          color: white;
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 2em;
        }
      </style>
      <base href="/" />
    </head>
    <body ${helmet.bodyAttributes.toString()}>
      <div id="app">${body}</div>
    </body>
    <script src="/public/bundle.js" defer></script>
  </html>
`;

export default html;
