import { Resource } from '@bbp/nexus-sdk';
declare type predicateFunction = (resource: Resource) => boolean;
export declare const chainPredicates: (
  predicates: predicateFunction[]
) => (resource: Resource) => boolean;
export declare const not: (
  predicate: predicateFunction
) => (resource: Resource) => boolean;
export declare const isOfType: (
  type: string
) => (resource: Resource) => boolean;
export declare const hasIdOf: (id: string) => (resource: Resource) => boolean;
export declare const isDeprecated: (resource: Resource) => boolean;
export declare const isView: (resource: Resource) => boolean;
export declare const isElasticView: (resource: Resource) => boolean;
export declare const isCompositeView: (resource: Resource) => boolean;
export declare const isDefaultElasticView: (resource: Resource) => boolean;
export declare const isSparqlView: (resource: Resource) => boolean;
export declare const isFile: (resource: Resource) => boolean;
export declare const toPromise: (func: Function) => () => Promise<any>;
export {};
