const base: string = process.env.BASE_PATH || '/';

const html = (): string => `
  <!doctype html>
  <html lang="en" dir="ltr">
    <head>
    </head>
    <body>
      <script src="${base}public/silent_refresh.js"></script>
    </body>
  </html>
`;

export default html;
