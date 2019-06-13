import { Resource } from '@bbp/nexus-sdk-legacy';

const NEXUS_FILE_TYPE = 'File';
const VIEW = 'View';
const ES_VIEW = 'ElasticSearchView';
const SPARQL_VIEW = 'SparqlView';

const isOfType = (type: string) => (resource: Resource) =>
  !!resource.type && resource.type.includes(type);

export const isDeprecated = (resource: Resource) => resource.deprecated;
export const isNotDeprecated = (resource: Resource) => !resource.deprecated;
export const isView = isOfType(VIEW);
export const isElasticView = isOfType(ES_VIEW);
export const isSparqlView = isOfType(SPARQL_VIEW);
export const isFile = (resource: Resource) =>
  resource && resource.type && resource.type.includes(NEXUS_FILE_TYPE);
