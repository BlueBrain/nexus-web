import fetch from 'node-fetch';
import { initNexusClient } from './studioMigration.js';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

async function rollBack(orgLabel, projectLabel, resourceId, rev, nexus) {
  const oldSource = await nexus.Resource.getSource(
    orgLabel,
    projectLabel,
    encodeURIComponent(resourceId),
    {
      rev,
    }
  );
  const updatedResource = await nexus.Resource.update(
    orgLabel,
    projectLabel,
    encodeURIComponent(resourceId),
    oldSource
  );
  return updatedResource._rev;
}

if (
  args.uri &&
  args.token &&
  args.projectLabel &&
  args.orgLabel &&
  args.resourceId &&
  args.rev
) {
  try {
    const nexus = initNexusClient(args.uri.trim(), args.token.trim(), fetch);
    const newRev = await rollBack(
      orgLabel,
      projectLabel,
      reourceId,
      rev,
      nexus
    );
    console.info(
      `Resource with id ${reourceId} has been updated with the source from revision ${rev}. New revision number is ${newRev}`
    );
  } catch {
    console.error(ex);
    console.info(`falied to rollBack ${args.resourceId}`);
  }
}
