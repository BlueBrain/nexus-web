import { NexusClient } from '@bbp/nexus-sdk/lib/types';

/**
 * Use specific resource endpoints when we have a "@type"
 * with a specific Nexus resource type. If no specific
 * Nexus resource then will default to the resource
 * endpoint.
 * @param nexus
 * @param revision
 * @param resource
 * @param originalResource
 * @param orgLabel
 * @param projectLabel
 * @param resourceId
 * @returns Nexus SDK function to call to perform update to resource
 */
export const getUpdateResourceFunction = (
  nexus: NexusClient,
  revision: number,
  resource: any,
  originalResource: any,
  orgLabel: string,
  projectLabel: string,
  resourceId: string
) => {
  const nexusReservedTypes = [
    'Organization',
    'Project',
    'Realm',
    'Resolver',
    'Schema',
    'Storage',
    'ElasticSearchView',
    'AggregateElasticSearchView',
    'SparqlView',
    'AggregateSparqlView',
    'CompositeView',
    'File',
  ];

  let matchedUpdateFunction;

  let resourceMatchedNexusTypes = [resource['@type']]
    .flat()
    .filter((value) => nexusReservedTypes.includes(value));

  if (resourceMatchedNexusTypes.length > 1) {
    throw new Error(
      'Resource cannot be specified as having multiple Nexus reserved resource types in the @type property.'
    );
  }

  const originalResourceMatchedNexusTypes = [originalResource['@type']]
    .flat()
    .filter((value) => nexusReservedTypes.includes(value));

  if (
    '@type' in resource &&
    originalResourceMatchedNexusTypes.length !== resourceMatchedNexusTypes.length
  ) {
    throw new Error('Cannot add/remove a Nexus reserved type from @type on an existing resource');
  }

  if (
    originalResourceMatchedNexusTypes.length === 1 &&
    resourceMatchedNexusTypes.length === 1 &&
    originalResourceMatchedNexusTypes[0] !== resourceMatchedNexusTypes[0]
  ) {
    throw new Error('Cannot change a Nexus reserved type from @type on an existing resource');
  }

  if ('@type' in originalResource && !('@type' in resource)) {
    resourceMatchedNexusTypes = originalResourceMatchedNexusTypes;
  }

  if (resourceMatchedNexusTypes.length === 1) {
    // Matches one of our resource types - lets use the specific endpoint
    if (resourceMatchedNexusTypes.includes('Organization')) {
      matchedUpdateFunction = () => nexus.Organization.update(orgLabel, revision, resource);
    } else if (resourceMatchedNexusTypes.includes('Project')) {
      matchedUpdateFunction = () =>
        nexus.Project.update(orgLabel, projectLabel, revision, resource);
    } else if (resourceMatchedNexusTypes.includes('Realm')) {
      matchedUpdateFunction = () =>
        nexus.Realm.update(originalResource['_label'], revision, resource);
    } else if (resourceMatchedNexusTypes.includes('Resolver')) {
      matchedUpdateFunction = () =>
        nexus.Resolver.update(orgLabel, projectLabel, resourceId, revision, resource);
    } else if (resourceMatchedNexusTypes.includes('Schema')) {
      matchedUpdateFunction = () =>
        nexus.Schema.update(orgLabel, projectLabel, resourceId, revision, resource);
    } else if (resourceMatchedNexusTypes.includes('Storage')) {
      matchedUpdateFunction = () =>
        nexus.Storage.update(orgLabel, projectLabel, resourceId, revision, resource);
    } else if (
      resourceMatchedNexusTypes.some((el) =>
        [
          'ElasticSearchView',
          'AggregateElasticSearchView',
          'SparqlView',
          'AggregateSparqlView',
          'CompositeView',
        ].includes(el)
      )
    ) {
      matchedUpdateFunction = () =>
        nexus.View.update(orgLabel, projectLabel, resourceId, revision, resource);
    } else if (resourceMatchedNexusTypes.includes('File')) {
      throw new Error('Updates to File are not supported via this method.');
    } else {
      throw new Error(
        'Changing the @type of a resource with a reserved Nexus type is not supported.'
      );
    }
  } else {
    // did not match one of our Nexus specific types - use generic resource endpoint
    matchedUpdateFunction = () =>
      nexus.Resource.update(orgLabel, projectLabel, resourceId, revision, resource);
  }
  return matchedUpdateFunction;
};
