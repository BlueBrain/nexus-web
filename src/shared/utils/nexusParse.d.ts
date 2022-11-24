export interface ParsedNexusUrl {
  url: string;
  deployment: string;
  apiVersion: string;
  entityType: string;
  org: string;
  project: string;
  schema?: string;
  id: string;
}
export declare const nexusUrlRegex: RegExp;
/**
 * With given Nexus URL (might be self/project/id url), return it's:
 * * deployment URL
 * * entity type
 * * org label
 * * project label
 * * id
 *
 * @param nexusUrl
 */
export declare const parseURL: (nexusUrl: string) => ParsedNexusUrl;
