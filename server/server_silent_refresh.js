const base = process.env.BASE_PATH || '/';

const htmlDev = () => `
<!doctype html>
<html>
  <head>
  </head>
  <body>
    <script src="../src/client_silent_refresh.js"></script>
  </body>
</html>
`;

const html = () => `
  <!doctype html>
  <html>
    <head>
    </head>
    <body>
      <script src="${base}public/client_silent_refresh.js"></script>
    </body>
  </html>
`;


export { htmlDev }
export default html;
