import * as express from 'express';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

const app = express();

const html = ({ body }: { body: string }) => `
  <!DOCTYPE html>
  <html>
    <head>
    </head>
    <body style="margin:0">
      <div id="app">${body}</div>
    </body>
    <script src="browser.js" defer></script>
  </html>
`;

app.get('/', (req: express.Request, res: express.Response) => {
  const body = renderToString(React.createElement(App));
  res.send(html({ body }));
});

app.listen(8000, () => {
  console.log('Now listening!!');
});

export default app;
