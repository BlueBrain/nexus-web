## Nexus Fusion

> Note: expect this repo to be renamed to https://github.com/BlueBrain/nexus-fusion to match the new application name and Nexus component branding scheme.

<p align="center">
  <img alt="Build Status" src="https://github.com/BlueBrain/nexus-web/workflows/Review/badge.svg">
  <a href="https://codecov.io/gh/BlueBrain/nexus-web">
    <img src="https://codecov.io/gh/BlueBrain/nexus-web/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=bluebrainnexus">
    <img alt="Follow on Twitter" src="https://img.shields.io/twitter/follow/bluebrainnexus.svg?style=social&label=Follow">
  </a>
</p>


<p align="center">Nexus Fusion (previously Nexus Web) is the interface of Blue Brain Nexus, the open-source knowledge graph for data-driven science.</p>

<p align="center">
  <a href="https://bluebrainnexus.io/docs/">Blue Brain Nexus Docs</a> |
  <a href="#Development">Development</a> |
  <a href="#studios-feature">Studios</a>
</p>

## Contributing

Learn how we use git [in the wiki](https://github.com/BlueBrain/nexus-web/wiki/Git-Flow)

## Development

Install dependencies:
**Please note you need npm v6.9.0 or above or yarn.**
**Currently, does not work with yarn 2.**

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
- `SECURE`: Is Nexus Fusion running in https or not. Default is `false`
- `GTM_CODE`: The Google Analytics Identifier. GA won't be present unless an ID is specified.
- `SENTRY_DSN`: The sentry URL Nexus Fusion needs to report errors to. Default is undefined.
- `STUDIO_VIEW`: The location of the aggregate elastic search view that contains all the projects: `orgLabel/projectLabel/viewId`

The following concern Plugins. [See how to manage plugin deployments](./docs/plugins.md)

- `PLUGINS_MANIFEST_PATH`: Remote end point where plugins and manifest can be found. for example, `https://bbp-nexus.epfl.ch/plugins`

## Deployment

You can find out how to deploy a build [in the wiki](https://github.com/BlueBrain/nexus-web/wiki/Deploying-Your-Nexus-Web-Instance)

## Documentation

### Studios Feature

This feature allows data curators to display their data using customisable, persistent queries. Using custom plugins developed with javascript, data curators can format the presentation of the query results any way they like.

You can create studios through the user interface. [Find out more about Studios here](./docs/studio/Studios.md).

### Nexus Plugins

Plugins are customisable components used to display in a domain-specific way. You can develop your own plugins! Have a look at the [plugin development documentation](./docs/pluginDevelopment.md) to learn more.

In development mode, you can copy/paste your plugins in the `/plugins` folder.

## Getting involved

Issue tracking is centralized into [the main Blue Brain Nexus repository](https://github.com/BlueBrain/nexus).

There are several channels provided to address different issues:

- **Feature request**: If there is a feature you would like to see in this application, please first consult the [list of open feature requests](https://github.com/BlueBrain/nexus/issues?q=is%3Aopen+is%3Aissue+label%3Afeature+label%3Afrontend+label%3Anexus-web). In case there isn't already one, please [open a feature request](https://github.com/BlueBrain/nexus/issues/new?labels=feature,frontend,nexus-web) describing your feature with as much detail as possible.
- **Bug report**: If you have found a bug, please create an issue [here](https://github.com/BlueBrain/nexus/issues/new?labels=bug,frontend,nexus-web).

## Development Tips

### When using the nexus sdk

- Never use `@id` as an absolute nexus address.
- avoid using `nexus.httpGet()`, instead, use the specific API methods available

### When building URLs inside the App

- Don't add the basePath in a URL, it will be added automatically by react-router.
