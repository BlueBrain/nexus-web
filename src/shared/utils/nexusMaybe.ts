import { Resource } from '@bbp/nexus-sdk/es';

const DEFAULT_ELASTIC_SEARCH_VIEW_ID = 'documents';
const NEXUS_FILE_TYPE = 'File';
const VIEW = 'View';
const ES_VIEW = 'ElasticSearchView';
const SPARQL_VIEW = 'SparqlView';
const COMPOSITE_VIEW = 'CompositeView';

type predicateFunction = (resource: Resource) => boolean;

// Helper functions
// asks a question in a row and returns the combined booleans
export const chainPredicates = (predicates: predicateFunction[]) => (resource: Resource) =>
  predicates.reduce((memo, predicate) => memo && predicate(resource), true);

// returns opposite of the predicate
export const not = (predicate: predicateFunction) => (resource: Resource) => !predicate(resource);

// Does this type match?
export const isOfType = (type: string) => (resource: Resource) =>
  !!resource['@type'] && resource['@type'].includes(type);

// Does this id match?
export const hasIdOf = (id: string) => (resource: Resource) => resource['@id'] === id;

// Get useful info about a resource
export const isDeprecated = (resource: Resource) => resource._deprecated;
export const isView = isOfType(VIEW);
export const isElasticView = isOfType(ES_VIEW);
export const isCompositeView = isOfType(COMPOSITE_VIEW);
export const isDefaultElasticView = chainPredicates([
  isOfType(ES_VIEW),
  hasIdOf(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
]);
export const isSparqlView = isOfType(SPARQL_VIEW);
export const isFile = isOfType(NEXUS_FILE_TYPE);
export const toPromise = (func: Function) => {
  return function() {
    return Promise.resolve(func(...arguments));
  };
};
