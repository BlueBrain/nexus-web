import fetch from 'node-fetch';
import {
  performMigrationforAStudio,
  initNexusClient,
} from './studioMigration.js';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

if (
  args.uri &&
  args.token &&
  args.projectLabel &&
  args.orgLabel &&
  args.studioId
) {
  try {
    console.log(args);
    const nexus = initNexusClient(args.uri.trim(), args.token.trim(), fetch);
    await performMigrationforAStudio(
      args.studioId.trim(),
      args.orgLabel.trim(),
      args.projectLabel.trim(),
      nexus
    );
  } catch (ex) {
    console.error(ex);
    console.info(`falied to migrate studio: ${args.studioId}`);
  }
} else {
  console.error(
    `Error: You are missing one of the following parameters .. uri, token, orgLabel, projectLabel, studioId`
  );
}
