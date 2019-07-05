import { Resource } from '@bbp/nexus-sdk-legacy';

const NEXUS_FILE_TYPE = 'File';
const VIEW = 'View';
const ES_VIEW = 'ElasticSearchView';
const AGGREGATE_ES_VIEW = 'AggregateElasticSearchView';
const AGGREGATE_SPARQL_VIEW = 'AggregateSparqlView';
const SPARQL_VIEW = 'SparqlView';
const DEFAULT_ELASTIC_SEARCH_VIEW_ID = 'nxv:defaultElasticSearchIndex';

const isOfType = (type: string) => (resource: Resource) =>
  !!resource.type && resource.type.includes(type);
const hasIdOf = (id: string) => (resource: Resource) =>
  resource.raw['@id'] === id;

type predicateFunction = (resource: Resource) => boolean;

// asks a question in a row and returns the combined booleans
export const and = (predicates: predicateFunction[]) => (resource: Resource) =>
  predicates.reduce((memo, predicate) => memo && predicate(resource), true);

export const or = (predicates: predicateFunction[]) => (resource: Resource) =>
  predicates.reduce((memo, predicate) => memo || predicate(resource), false);

export const not = (predicate: predicateFunction) => (resource: Resource) =>
  !predicate(resource);
export const isDeprecated = (resource: Resource) => resource.deprecated;
export const isView = isOfType(VIEW);
export const isElasticView = or([
  isOfType(ES_VIEW),
  isOfType(AGGREGATE_ES_VIEW),
]);
export const isDefaultElasticView = and([
  isOfType(ES_VIEW),
  hasIdOf(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
]);
export const isSparqlView = or([
  isOfType(SPARQL_VIEW),
  isOfType(AGGREGATE_SPARQL_VIEW),
]);
export const isFile = (resource: Resource) =>
  resource && resource.type && resource.type.includes(NEXUS_FILE_TYPE);
