# Nexus Web

> Transform your data into a fully searchable linked-data graph

Nexus Web is the interface of Blue Brain Nexus, the open-source knowledge graph for data-driven science. 

## Development

Install dependencies:
``` npm i ```

To start the Nexus in development mode, run:
``` npm run start ```

Lint code:
``` npm run lint```

Run unit tests:
``` npm test ```

## Build for production

Compile app in `dist/` folder.
``` npm run build ```

You can run the app with:
``` node dist/server.js ```

## Build a Docker image

``` docker build . --tag=nexus-web ```
