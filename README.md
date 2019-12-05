![Build Status](https://github.com/BlueBrain/nexus-web/workflows/Review/badge.svg)
[![codecov](https://codecov.io/gh/BlueBrain/nexus-web/branch/master/graph/badge.svg)](https://codecov.io/gh/BlueBrain/nexus-web)

# Nexus Web

> Transform your data into a fully searchable linked-data graph

Nexus Web is the interface of Blue Brain Nexus, the open-source knowledge graph for data-driven science.

## Development

Install dependencies:
**Please note you need npm v6.9.0 or above or yarn**

```sh
yarn
```

To start the Nexus in development mode, run:

```sh
yarn start
```

Lint code:

```sh
yarn lint
```

Run unit tests:

```sh
yarn test
```

## Build for production

Compile app in `dist/` folder.

```sh
yarn build
```

You can run the app with:

```sh
node dist/server.js
```

## Build a Docker image

```sh
docker build . --tag=nexus-web
```

## ENV variables list

- `BASE_PATH`: The base of the app: i.e. `/staging/web` if hosted on `https://bbp-nexus.epfl.ch/staging/web` (default is `/`)
- `HOST_NAME`: name of host where application is available from: i.e. `https://bbp-nexus.epfl.ch` (default is protocol + host where server is running from)
- `CLIENT_ID`: The application name used for _OpenID Connect_ authentication (default is `nexus-web`)
- `API_ENDPOINT`: The URL pointing to Nexus API. Default is '/'
- `SECURE`: Is nexus web running in https or not. Default is `false`
- `GTAG`: The Google Analytics Identifier. GA won't be present unless an ID is specified.
- `SENTRY_DSN`: The sentry URL Nexus Web needs to report errors to. Default is undefined.

## Getting involved

Issue tracking is centralized into [the main Blue Brain Nexus repository](https://github.com/BlueBrain/nexus).

There are several channels provided to address different issues:

- **Feature request**: If there is a feature you would like to see in this application, please first consult the [list of open feature requests](https://github.com/BlueBrain/nexus/issues?q=is%3Aopen+is%3Aissue+label%3Afeature+label%3Afrontend+label%3Anexus-web). In case there isn't already one, please [open a feature request](https://github.com/BlueBrain/nexus/issues/new?labels=feature,frontend,nexus-web) describing your feature with as much detail as possible.
- **Bug report**: If you have found a bug, please create an issue [here](https://github.com/BlueBrain/nexus/issues/new?labels=bug,frontend,nexus-web).
