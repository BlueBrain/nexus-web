import React = require('react');
import { ReactElement } from 'react';
import Helmet from 'react-helmet';
import { renderToString } from 'react-dom/server'

// const html = ({ body }: { body: string }): string => {
//   const helmet = Helmet.renderStatic();
//   return '<!doctype html>\n' + renderToString(
  
//     <html>
//       <head>
//         <style>
//           {`  body {
//             background-color: #ff6666;
//             color: white;
//             font-family: Arial, Helvetica, sans-serif;
//             margin: 0;
//             padding: 2em;
//           }`}
//         </style>
//         {helmet.title.toComponent()}
//         {helmet.meta.toComponent()}
//         {helmet.link.toComponent()}
//       </head>
//       <body>
//         <div id="app">{body}</div>
//       </body>
//       <script src="/public/bundle.js" defer></script>
//     </html>
//   )
// }

/**
 * 
 * @param body 
 * @returns string The HTML document
 */
const html = ({ body /*, title, meta, link */ }: { body: string }): string => `
  <!doctype html>
  <html>
    <head>
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
    <body>
      <div id="app">${body}</div>
    </body>
    <script src="/public/bundle.js" defer></script>
  </html>
`

export default html;