# Studio Migrations

To migrate all studios, run the following command.

`node studioMigration.js --uri={uri} --token={token}`

Here, uri is the base url for you delta installation. Token is your nexus user token. This script will migrate all studios with write access for the given token from the old format (pre v1.7.0) to new format (v1.7.0+).

To migrate a single studio, run the following command.

`node singleStudioMigration.js --uri={uri} --token={token} --projectLabel={projectLabel} --orgLabel={orgLabel} --studioId={studioId}`

To reverse the migration on any resource, run the following command.

`node rollBack.js --uri={uri} --token={token} --projectLabel={projectLabel} --orgLabel={orgLabel} --resourceId={resourceId} --rev={rev}`

Where, rev is the target revision to which you want to reverse the status of the resource.
