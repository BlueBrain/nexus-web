[Roadmap](#roadmap) |
[Development](#development) |
[Build for Prod](#build-for-production) |
[License](#license)

# Nexus Web

> Transform your data into a fully searchable linked-data graph

Nexus Web is the interface of Blue Brain Nexus, the open-source knowledge graph for data-driven science. It allows you to administrate, browse and query you data within [Nexus](https://bluebrain.github.io/nexus/).

## Roadmap

Nexus Web is in active development.

The main goal is:

- support all [Nexus v1](https://bluebrain.github.io/nexus/docs/index.html) operations through a graphic interface
- build a set of tools to ease, simplify and assist with data ingestion, integration and exploration

You can find the roadmap [here](./roadmap.md).

## Development

Install dependencies:

```sh
npm i
```

To start the Nexus in development mode, run:

```sh
npm run start
```

Lint code:

```sh
npm run lint
```

Run unit tests:

```sh
npm test
```

## Build for production

Compile app in `dist/` folder.

```sh
npm run build
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
- `CLIENT_ID`: The application name used for _OpenID Connect_ authentication
- `API_ENDPOINT`: The URL pointing to Nexus API. Default is '/'
<<<<<<< HEAD
- `AUTH_ENDPOINT`: _OpenID Connect_ Authentication endpoint. Empty by default (no auth).
- `LOGOUT_ENDPOINT`: _OpenID Connect_ Logout endpoint. Empty by default (no logout).
=======

# License

- [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)
>>>>>>> first draft
