<img src="docs/Blue-Brain-Nexus-Fusion-Github-banner.jpg" alt="Nexus Fusion"/>

<p align="center">
  <img alt="Build Status" src="https://github.com/BlueBrain/nexus-web/workflows/Review/badge.svg">
  <a href="https://codecov.io/gh/BlueBrain/nexus-web">
    <img src="https://codecov.io/gh/BlueBrain/nexus-web/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>

  <a href="https://twitter.com/intent/follow?screen_name=bluebrainnexus">
    <img alt="Follow on Twitter" src="https://img.shields.io/twitter/follow/bluebrainnexus.svg?style=social&label=Follow">
  </a>
</p>

> Note: expect this repo to be renamed to `https://github.com/BlueBrain/nexus-fusion` to match the new application name and Nexus component branding scheme.

# Nexus Fusion

An extensible, open-source web interface that thrives on your data. With workspaces, plugins, and an admin interface available out-of-the-box, you can start working with your ingested data immediately.


- [Contributing](#contributing)
- [Codebase](#codebase)
- [Technologies](#technologies)
- [Folder Structure](#folder-structure)
- [Code Style](#code-style)
- [First time setup](#first-time-setup)
- [Running the app locally](#running-the-app-locally)
- [Build app for production](#running-for-production)
- [Envirement variables](#enviroment-variables)

## Contributing

**We heartily welcome any and all contributions that match our engineering standards!**

Please learn how we use git [git flow](https://github.com/BlueBrain/nexus-web/wiki/Git-Flow)

#### Contributions and discussion guidelines

All conversations and and tickets are shared in zenhub [Tickets](https://github.com/BlueBrain/nexus/discussions#zenhub)

#### Reporting a bug or discussing a feature idea

If you found a technical bug on Fusion or have ideas for features we should implement, the issue tracker is the best place to share your ideas. Make sure to follow the issue template and you should be golden! ([click here to open a new issue](https://github.com/bluebrain/nexus/issues/new))

#### Fixing a bug or implementing a new feature

If you find a bug on Fusion and open a PR that fixes it we'll review it as soon as possible to ensure it matches our engineering standards.

## Codebase

### Technologies

We use React to power Fusion, so all of the code you'll touch in this codebase will be Typescript/JavaScript.

Here is a list of all the big technologies we use:

- **React**: Frontend React app
- **Vite**: Build the application
- **AntdV5**: React Components Library
- **Nexus-sdk**: An abstracted sdk layer over Blue Brain Nexus to make developing clients and services more simple.
- **React-nexus** A set of react tools to allow an easier and faster integration with Nexus.
- **Typescript**: Type-safe JavaScript.
- **oidc-client**: Authentication.

### Folder structure

```sh

    fusion/
    ├── server     # Express app to start the app (both in dev and prod)
    ├── src        # Frontend SPA
        ├── pages      # Top level pages
        ├── subapp     # Old version pages (migration on progress) 
        ├── shared     # Shared components

```

### Code Style

We run Prettier on-commit, which means you can write code in whatever style you want and it will be automatically formatted according to the common style when you run `git commit`. We also have ESLint set up.

### Rules

To add rules

## First time setup

The first step to run Fusion locally is downloading the code by cloning the repository:

```sh

git clone git@github.com:BlueBrain/nexus-web.git

```

If you get `Permission denied` error using `ssh` refer [here](https://help.github.com/articles/error-permission-denied-publickey/)

or use `https` link as a fallback.

```sh

git clone https://github.com/BlueBrain/nexus-web.git

```

## Running the app locally

**Install dependencies**:

```sh
    yarn install
```

**Required ENV var**

1. Find the path to .bash_profile by using: `~/.bash-profil`
2. Open the .bash_profile file with a text editor of your choice.
3. Scroll down to the end of the .bash_profile file.
4. Use the export command to add new environment variables:

```sh
export API_ENDPOINT=xxx
export PLUGINS_MANIFEST_PATH=xxx
```

5. Save any changes you made to the .bash_profile file.
6. Execute the new .bash_profile by either restarting the  terminal window or using:

```sh
source~/.bash-profile
```

**Run the app**

You've now finished installing everything! let's run the app

```sh
    yarn dev
```

if you want to pass adding env variables you can included it in the run command

```sh
    API_ENDPOINT=xxx PLUGINS_MANIFEST_PATH=xxx yarn dev
```

## Build app for production
// to add

## Envirement variables

- `API_ENDPOINT`: The root url for delta API endpoint
- `BASE_PATH`: The base of the app: i.e. `/staging/web` if hosted on `https://bbp-nexus.epfl.ch/staging/web` (default is `/`)
- `HOST_NAME`: name of host where application is available from: i.e. `https://bbp-nexus.epfl.ch` (default is protocol + host where server is running from)
- `CLIENT_ID`: The application name used for _OpenID Connect_ authentication (default is `nexus-web`)
- `API_ENDPOINT`: The URL pointing to Nexus API. Default is '/'
- `SERVICE_ACCOUNTS_REALM`: The realm that is configured for service accounts that should be hidden for Login. Default is 'serviceaccounts'.
- `SECURE`: Is Nexus Fusion running in https or not. Default is `false`
- `GTM_CODE`: The Google Analytics Identifier. GA won't be present unless an ID is specified.
- `SENTRY_DSN`: The sentry URL Nexus Fusion needs to report errors to. Default is undefined.
- `STUDIO_VIEW`: The location of the aggregate elastic search view that contains all the projects: `orgLabel/projectLabel/viewId`
- `LOGO_IMG`: Url for an image to be used as application logo in the Header, for example, https://www.epfl.ch/logo-img.png
- `LOGO_LINK`: Url for the logo, for example, https://www.epfl.ch
- `ORGANIZATION_IMG`: Url for the organization page foreground image, for example, https://www.epfl.ch/default-org-img.png
- `PROJECTS_IMG`: Url for the projects page foreground image, for example,https://www.epfl.ch/default-projects-img.png
- `STUDIOS_IMG`: Url for the studios page foreground image, for example, https://www.epfl.ch/default-studios-img.png
- `LANDING_VIDEO`: Url for video in the the landing page, for example, https://www.epfl.ch/landing-page-video.mp4
- `LANDING_POSTER_IMG`: Url for the video’s poster image in landing page (replace the video when loading, for example,https://www.epfl.ch/landing-page-poster-img.png
- `MAIN_COLOR`: Url for the organization page, for example “#062d68”
- If you use Nexus Forge, it is possible to include a Forge templates button by providing the url as `FORGE_LINK`, for example, https://some-url.hi
- `PLUGINS_MANIFEST_PATH`: The plugin endpoint (to fetch the manifest and the js file for plugins)



## Funding & Acknowledgment

The development of this software was supported by funding to the Blue Brain Project, a research center of the École polytechnique fédérale de
Lausanne (EPFL), from the Swiss government's ETH Board of the Swiss Federal Institutes of Technology.

Copyright © 2015-2023 Blue Brain Project/EPFL
