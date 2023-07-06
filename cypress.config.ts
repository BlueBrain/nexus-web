import { createNexusClient, ResourcePayload } from '@bbp/nexus-sdk';
import { defineConfig } from 'cypress';
import {
  createNexusOrgAndProject,
  createResource,
  deprecateNexusOrgAndProject,
} from './cypress/plugins/nexus';
import { uuidv4 } from './src/shared/utils';
import setup, { TestUsers } from './cypress/support/setupRealmsAndUsers';

const fetch = require('node-fetch');

export default defineConfig({
  projectId: '1iihco',
  viewportWidth: 1200,
  video: true,
  e2e: {
    baseUrl: 'http://localhost:8000',
    fileServerFolder: '/cypress',
    defaultCommandTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // @ts-ignore
    experimentalSessionAndOrigin: true,
    testIsolation: 'off',
    chromeWebSecurity: false,

    env: {
      DEBUG: 'cypress:launcher:browsers',
      ELECTRON_DISABLE_GPU: 'true',
      ELECTRON_EXTRA_LAUNCH_ARGS: '--disable-gpu',
    },
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        launchOptions.args.push('--window-size=1920,1080');
        if (browser.name == 'chrome') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push(
            '--unsafely-treat-insecure-origin-as-secure=http://keycloak.test:8080'
          );
        }
        return launchOptions;
      }),
        on('task', {
          'auth:createRealmsAndUsers': async function(users: {
            [key: string]: {
              username: string;
              password: string;
              realm: { name: string; baseUrl: string };
            };
          }) {
            await setup(users);
            return null;
          },
          log(message) {
            console.log(message);
            return null;
          },
          'project:setup': async function({
            nexusApiUrl,
            authToken,
            orgLabel,
            projectLabelBase,
          }: {
            nexusApiUrl: string;
            authToken: string;
            orgLabel: string;
            projectLabelBase: string;
          }) {
            const orgDescription =
              'An organization used for Cypress automated tests';
            const projectLabel = `${projectLabelBase}-${uuidv4()}`;
            const projectDescription =
              'An project used for Cypress automated tests';
            console.log('Auth TOKEN', authToken);
            try {
              const nexus = createNexusClient({
                uri: nexusApiUrl,
                fetch,
                token: authToken,
              });
              await createNexusOrgAndProject({
                nexus,
                orgLabel,
                orgDescription,
                projectLabel,
                projectDescription,
              });
            } catch (e) {
              console.log('Error encountered in project:setup task.', e);
            }
            return { projectLabel };
          },
          'project:teardown': async ({
            nexusApiUrl,
            authToken,
            orgLabel,
            projectLabel,
          }: {
            nexusApiUrl: string;
            authToken: string;
            orgLabel: string;
            projectLabel: string;
          }) => {
            try {
              const nexus = createNexusClient({
                uri: nexusApiUrl,
                fetch,
                token: authToken,
              });

              deprecateNexusOrgAndProject({
                nexus,
                orgLabel,
                projectLabel,
              });
            } catch (e) {
              console.log('Error encountered in project:teardown task.', e);
            }

            return null;
          },
          'resource:create': async ({
            nexusApiUrl,
            authToken,
            resourcePayload,
            orgLabel,
            projectLabel,
          }: {
            nexusApiUrl: string;
            authToken: string;
            resourcePayload: ResourcePayload;
            orgLabel: string;
            projectLabel: string;
          }) => {
            try {
              const nexus = createNexusClient({
                uri: nexusApiUrl,
                fetch,
                token: authToken,
              });

              return await createResource({
                nexus,
                orgLabel,
                projectLabel,
                resource: resourcePayload,
              });
            } catch (e) {
              console.log(
                'Error encountered in analysisResource:create task.',
                e
              );
            }
            return null;
          },
        });

      if (!config.env.users) {
        config.env.users = TestUsers;
      }
      if (!config.env.ORG_LABEL) {
        config.env.ORG_LABEL = 'Cypress-Testing';
      }
      if (!config.env.PROJECT_LABEL_BASE) {
        config.env.PROJECT_LABEL_BASE = 'e2e';
      }

      return config;
    },
  },
});
