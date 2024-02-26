# Our JavaScript workflow

- lint code
- test code
- transpile code for server
- transpile and bundle code for client

## Transpiler and Bundler

Modern JavaScript based projects need two things:

- a transpiler that converts code from one form to a specific ECMA compatible version
- a bundler, that resolves module dependencies and create a single file for web browsers

### Transpiler

You can write JavaScript against the latest ECMA specification and convert it in order to target an old browser or an old version of Node.js.

One of the most famous transpiler is babel. It will convert things like:

```javascript
const add = (a, b) => a + b;
```

into (depending on your settings):

```javascript
function add(a, b) {
  return a + b;
}
```

You can can try it online using [Babel's playground](https://babeljs.io/en/repl)

In our case, we are using TypeScript's transpiler, which will convert TypeScript (TS) code into JavaScript (JS).

It will convert something like:

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

Into:

```javascript
function add(a, b) {
  return a + b;
}
```

Using a transpiler gives you several benefits:

- you can use the latest version of the language, with all the nice new syntax sugar
- you can configure it, so you can target an even older browser just by tweaking settings
- it does a static analysis of your code (with static type check in the case of TS) in order to prevent errors

### Bundler

For web browsers, we need to stitch all of the modules into a single bundle. This is when a bundler, such as Webpack, Rollup, Browserify comes in.

It will transform something like:

```javascript
// in src/maths.js
export function add(a, b) {
  return a + b;
}

// in src/index.js
import { add } from './maths';
console.log(add(1, 2));
```

into:

```javascript
// in dist/bundle.js
function add(a, b) {
  return a + b;
}
console.log(add(1, 2));
```

They usually do some more advance operations, like tree-shaking for example, in order to minimise the final bundle size.

## Lint

We use `ts-lint` with Airbnb rules.

## Unit and Integration tests

We use `vitest` for our tests. It's a test runner that supports both unit and integration tests.

## End-to-End Testing

End-to-testing is implemented with [Cypress]('https://www.cypress.io'). The `cypress-testing-library`` package is used to support the same dom-testing queries as used in our unit and integration tests.

Cypress has a desktop application as well as a CLI. The desktop application is useful when browsing and debugging tests.

### Configuration

There are a few Cypress environment variables that must be specified in order for the tests to run successfully. The cypress.env.json.sample includes these variables. Rename the file to cypress.env.json in order for it be picked up by Cypress and set the variables appropriately. Note that if you specify any Cypress variable at the command line it must be prefixed with CYPRESS\_ and it will override any variables set in the cypress.env.json file.

- **use_existing_delta_instance** whether to use an existing instance of Delta or a new one is being set-up
- **NEXUS_API_URL** the url to the Nexus API for which the tests will be run. It is used as part of the setup and teardown process
- **BASE_URL** _optional_ Defaults to <http://localhost:8000>
- **ORG_LABEL** _optional_ Defaults to Cypress-Testing
- **PROJECT_LABEL_BASE** _optional_ Defaults to e2e

### Cypress desktop app

Make sure the Nexus web app is running locally, then run:

```sh
CYPRESS_AUTH_REALM=https://auth.realm.url/ \
CYPRESS_AUTH_USERNAME=nexus_username \
CYPRESS_AUTH_PASSWORD=nexus_password \
CYPRESS_NEXUS_API_URL=https://nexusapi.url/v1 \
yarn cy:open --e2e --browser chrome
```

### CLI

Make sure the Nexus web app is running locally, then run:

```sh
CYPRESS_AUTH_REALM=https://auth.realm.url/ \
CYPRESS_AUTH_USERNAME=nexus_username \
CYPRESS_AUTH_PASSWORD=nexus_password \
CYPRESS_NEXUS_API_URL=https://nexusapi.url/v1 \
yarn cy:run --e2e --browser chrome
```

All of the tests will run in headless mode.

## Debugging End-to-End test failures in CI

There are several differences in how our end-to-end tests are executed in the CI compared to local runs. We employ distinct instances of delta, Postgres, Keycloak, and other components in each environment. Moreover, the version of Chrome you have locally may not match the one used in the CI. Additionally, the machine's CPU and memory are likely to vary. These differences can pose challenges when debugging test failures in the CI.

The videos and screenshots of tests are uploaded to [cypress cloud](https://cloud.cypress.io). If these are not sufficient to debug the issue, follow along.

1. Remove your `node_modules` folder locally and reinstall the dependencies to be sure that they are exactly the same as in our CI:

```sh
rm -rf node_modules
yarn install --frozen-lockfile
```

2. Create the Docker image for Fusion:

```sh
sudo docker build . --tag=nexus-web:fresh
```

You may need to run the above command with sudo privileges

3. [Optional] You may want to mount your local code inside the container. This will allow you to make changes and see their results quickly, as opposed to make changes, copy the changes into the container, and then see their results. You'll need to update the `cypress` service section inside your `docker-compose.yml` for this:

```sh
  cypress:
    image: 'cypress/included:12.17.0'
    volumes:   # This is the change
      - ../:/e2e
    user: ${CYPRESS_USER} # You can also set a user here to avoid issues with file permissions. This is optional.
```

4. Start services defined in docker-compose file:

If you followed step 3:

```sh
CYPRESS_USER=$UID sudo --preserve-env=CYPRESS_USER docker-compose -f ci/docker-compose.yml up -d
```

Otherwise:

```sh
sudo docker compose -f ci/docker-compose.yml up -d
sudo docker cp ./. cypress:/e2e
```

5. Run the tests as they would in ci:

```sh
yarn run cy:ci
```

6. You can also navigate to <http://fusion.test:8000> in your browser to see the same instance of fusion that cypress is testing.

7. Remember to stop the services once done:

```sh
sudo docker compose -f ci/docker-compose.yml down --rmi "local" --volumes
```
