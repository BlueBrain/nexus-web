import { createNexusClient, ResourcePayload } from '@bbp/nexus-sdk';
import { defineConfig } from 'cypress';
import {
  createNexusOrgAndProject,
  createResource,
  deprecateNexusOrgAndProject,
} from './cypress/plugins/nexus';
import { uuidv4 } from './src/shared/utils';
const fetch = require('node-fetch');

export default defineConfig({
  viewportWidth: 1200,
  video: false,
  e2e: {
    experimentalSessionAndOrigin: true,
    baseUrl: 'http://localhost:8000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      on('task', {
        'project:setup': async ({ authToken }: { authToken: string }) => {
          // TODO: these should come from config
          const orgLabel = 'Cypress-Testing';
          const orgDescription =
            'An organization used for Cypress automated tests';
          const projectLabel = 'e2e-' + uuidv4();
          const projectDescription =
            'An project used for Cypress automated tests';

          const nexusApiUrl = 'https://dev.nise.bbp.epfl.ch/nexus/v1';

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
          return { orgLabel, projectLabel };
        },
        'project:teardown': async ({
          authToken,
          orgLabel,
          projectLabel,
        }: {
          authToken: string;
          orgLabel: string;
          projectLabel: string;
        }) => {
          try {
            const nexusApiUrl = 'https://dev.nise.bbp.epfl.ch/nexus/v1';

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
          authToken,
          resource,
          orgLabel,
          projectLabel,
        }: {
          authToken: string;
          resource: ResourcePayload;
          orgLabel: string;
          projectLabel: string;
        }) => {
          try {
            const nexusApiUrl = 'https://dev.nise.bbp.epfl.ch/nexus/v1';

            const nexus = createNexusClient({
              uri: nexusApiUrl,
              fetch,
              token: authToken,
            });

            return await createResource({
              nexus,
              orgLabel,
              projectLabel,
              resource,
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
    },
  },
});
