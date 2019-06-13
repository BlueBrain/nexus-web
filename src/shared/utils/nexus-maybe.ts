import { Resource } from '@bbp/nexus-sdk';

const NEXUS_FILE_TYPE = 'File';
const VIEW = 'View';
const ES_VIEW = 'ElasticSearchView';
const SPARQL_VIEW = 'SparqlView';

const DEFAULT_ELASTIC_SEARCH_VIEW_ID = 'nxv:defaultElasticSearchIndex';

const isOfType = (type: string) => (resource: Resource) =>
  !!resource.type && resource.type.includes(type);
const hasIdOf = (id: string) => (resource: Resource) =>
  resource.raw['@id'] === id;

type predicateFunction = (resource: Resource) => boolean;

// asks a question in a row and returns the combined booleans
export const chainPredicates = (predicates: predicateFunction[]) => (
  resource: Resource
) => predicates.reduce((memo, predicate) => memo && predicate(resource), true);

export const not = (predicate: predicateFunction) => (resource: Resource) =>
  !predicate(resource);
export const isDeprecated = (resource: Resource) => resource.deprecated;
export const isView = isOfType(VIEW);
export const isElasticView = isOfType(ES_VIEW);
export const isDefaultElasticView = chainPredicates([
  isOfType(ES_VIEW),
  hasIdOf(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
]);
export const isSparqlView = isOfType(SPARQL_VIEW);
export const isFile = (resource: Resource) =>
  resource && resource.type && resource.type.includes(NEXUS_FILE_TYPE);
