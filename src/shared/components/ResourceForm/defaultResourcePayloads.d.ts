export declare const DEFAULT_RESOURCE: {
  '@id': string;
  '@type': never[];
};
export declare const DISK_STORAGE: {
  '@id': string;
  '@type': string;
  default: boolean;
  volume: string;
};
export declare const REMOTE_STORAGE: {
  '@id': string;
  '@type': string;
  default: boolean;
  folder: string;
};
export declare const SPARQL_VIEW: {
  '@id': string;
  '@type': string;
  resourceSchemas: never[];
  resourceTypes: never[];
  includeMetadata: boolean;
  includeDeprecated: boolean;
};
export declare const ELASTIC_SEARCH_VIEW: {
  '@id': string;
  '@type': string;
  resourceSchemas: never[];
  resourceTypes: never[];
  sourceAsText: boolean;
  includeMetadata: boolean;
  includeDeprecated: boolean;
  mapping: {};
};
export declare const COMPOSITE_VIEW: {
  '@id': string;
  '@type': string[];
  sources: never[];
  projections: never[];
  rebuildStrategy: string;
};
export declare const AGGREGATE_ES_VIEW: {
  '@id': string;
  '@type': string;
  views: {
    project: string;
    viewId: string;
  }[];
};
export declare const AGGREGATE_SPARQL_VIEW: {
  '@id': string;
  '@type': string;
  views: {
    project: string;
    viewId: string;
  }[];
};
export declare const IN_PROJECT: {
  '@id': string;
  '@type': string;
  priority: number;
};
export declare const CROSS_PROJECT: {
  '@id': string;
  '@type': string;
  resourceTypes: never[];
  projects: never[];
  identities: never[];
  priority: number;
};
export declare const DEFAULT_RESOURCES: {
  [key: string]: any;
};
export declare const RESOURCES_SCHEMA_URI: {
  [key: string]: string;
};
export declare const RESOURCES_TYPES_URLS: {
  [key: string]: string;
};
