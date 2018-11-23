# Nexus Web

> Transform your data into a fully searchable linked-data graph

Nexus Web is the interface of Blue Brain Nexus, the open-source knowledge graph for data-driven science.

## Development

> :warning:
>
> **You need to clone [nexus-webapp-commons](https://github.com/BlueBrain/nexus-webapp-commons) at the same level as this project. Reason being this App uses [Nexus JS SDK](https://github.com/BlueBrain/nexus-webapp-commons/tree/master/nexus-sdk-js) which is not yet published on NPM.**
>
> Your folder structure should look like that:
>
> ```
> .
> +-- nexus-web
> |   +-- package.json
> +-- nexus-webapp-commons
> |   +-- nexus-sdk-js
> |       +-- package.json
> ```
>
> You can run `npm run build:es -- -w` and `npm run build:commonjs -- -w` (at the same time, in 2 separate terminals) on the SDK project and start using it as per the documentation.

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
