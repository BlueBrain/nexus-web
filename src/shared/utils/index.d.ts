import { Resource, Identity } from '@bbp/nexus-sdk';
import moment from 'moment';
/**
 * getProp utility - an alternative to lodash.get
 * @author @harish2704, @muffypl, @pi0
 * @param {Object} object
 * @param {String|Array} path
 * @param {*} defaultVal
 */
export declare const getProp: (
  object: any,
  path: string | any[],
  defaultVal?: any
) => any;
/**
 * moveTo utility - move an array element to a new index position
 * @author Richard Scarrott
 * @param {Array} array
 * @param {number} from
 * @param {number} to
 */
export declare const moveTo: (array: any[], from: number, to: number) => any[];
/**
 * creates a random UUID
 * @author https://stackoverflow.com/users/109538/broofa
 * @export
 * @returns {string}
 */
export declare function uuidv4(): string;
/**
 * Given an array of identities, returns a list of usernames or []
 *
 * @param {Identity[]} identities an array of identities
 * @returns {string[]} A list of usernames, or an empty array
 */
export declare const getUserList: (
  identities: Identity[]
) => (string | undefined)[];
/**
 *  Given an array of identities, returns a unique list of permissions, in importance order.
 * - Anonymous
 * - Authenticated
 * - User
 *
 * If a project has an identity of type anonymous, then is it "public" access
 * If a project has an identity of type authenticated, then all authenticated users have access
 * If a project has an identity of type User, only this or these users will have access
 *
 * @param {Indentity[]} identities
 * @returns {string[]} list of ordered permissions
 */
export declare const getOrderedPermissions: (
  identities: Identity[]
) => Identity['@type'][];
export declare const asyncTimeout: (
  timeInMilliseconds: number
) => Promise<void>;
/**
 * Ensure a path fragment has a leading slash, to compute routes.
 */
export declare const addLeadingSlash: (path: string) => string;
/**
 * Compute route path without base path.
 *
 * Useful when using MemoryHistory which does not support `basename`.
 *
 * Code taken from react-router StaticRouter component's private methods.
 */
export declare const stripBasename: (basename: string, path: string) => string;
export declare const labelOf: (inputString: string) => string;
export declare const isBrowser: boolean;
export declare function isUserInAtLeastOneRealm(
  userIdentities: Identity[],
  realm: string[]
): boolean;
/**
 * Returns the logout URL of the realm the user is authenticated with
 *
 * @param identities
 * @param realms
 */
export declare function getLogoutUrl(
  identities: Identity[],
  realms: {
    label: string;
    endSessionEndpoint: string;
  }[]
): string;
export declare function hasExpired(timestamp: number): Boolean;
/**
 * Get data string to display
 *
 * @param date
 * @returns date string
 */
export declare function getDateString(
  date: Date | moment.Moment,
  options?: {
    noTime?: boolean;
  }
): any;
/**
 *
 * @param historicalDate The date in the past to measure against
 * @param now The datetime now, defaults to current timestamp
 * @returns a user friendly string
 */
export declare function getFriendlyTimeAgoString(
  historicalDate: Date | moment.Moment,
  now?: Date | moment.Moment
): string;
export declare function getDestinationParam(): string;
/**
 * Returns a nice username
 *
 * @param user a url-like user https://api.bluebrainnexus.io/v1/realms/myrealm/users/kenny
 * @returns a nice username
 */
export declare function getUsername(user: string): string;
export declare function blacklistKeys(
  raw: {
    [key: string]: any;
  },
  keys: string[]
): any;
/**
 * Returns a nice human label based on @mfsy 's suggestions
 *
 * @param {Resource} resource
 * @returns {string} human readable label
 */
export declare function getResourceLabel(
  resource: Resource & {
    [key: string]: any;
  }
): any;
/**
 * Returns a resource's project and org label
 *
 * @param {resource} Resource
 * @returns {{
 * orgLabel: string,
 * projectLabel: string,
 * }}
 */
export declare function getOrgAndProjectFromResource(
  resource: Resource
): {
  orgLabel: string;
  projectLabel: string;
};
/**
 * Returns a resource's project and org label
 *
 * @param {string} projectId
 * @returns {{
 * orgLabel: string,
 * projectLabel: string,
 * }}
 */
export declare function getOrgAndProjectFromProjectId(
  projectId: string
): {
  orgLabel: string;
  projectLabel: string;
};
/**
 * Returns a project and org labels from url
 *
 * @param {projectUrl} string
 * @returns {
 * [org: string, proj: string]
 * }
 */
export declare const parseProjectUrl: (projectUrl: string) => string[];
/**
 * this function changes cameCasedString to Camel Cased String
 * @author https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case
 * @param labelString String in camelCase
 */
export declare const camelCaseToLabelString: (labelString: string) => string;
export declare const camelCaseToTitleCase: (camelCase: string) => string;
export declare const matchResultUrls: (entry: string) => string;
export declare const isISODate: (date: string) => boolean;
export declare const matchPlugins: (
  pluginMap: Object,
  plugins: string[],
  resource: Resource
) => string[];
export declare type PluginMapping = {
  [pluginKey: string]: object;
};
export declare const pluginsMap: (pluginManifest: any) => PluginMapping;
export declare const pluginsExcludeMap: (pluginManifest: any) => PluginMapping;
export declare const makeStudioUri: (
  orgLabel: string,
  projectLabel: string,
  studioId: string
) => string;
export declare const makeProjectUri: (
  orgLabel: string,
  projectLabel: string
) => string;
export declare const makeOrganizationUri: (orgLabel: string) => string;
export declare const makeSearchUri: (searchQueryParam: string) => string;
/**
 * Returns Resource uri
 *
 * @param orgLabel Organisation label
 * @param projectLabel Project label
 * @param resourceId Resource ID
 * @param options Optional additional options including revision, tab, expanded.
 * @returns
 */
export declare const makeResourceUri: (
  orgLabel: string,
  projectLabel: string,
  resourceId: string,
  options?: {
    revision?: number | undefined;
    tab?: string | undefined;
    expanded?: boolean | undefined;
  }
) => string;
export declare const parseJsonMaybe: <T = object>(
  str: string | null | undefined,
  errorCallback?: ((error: Error) => void) | undefined
) => T | null;
export declare const forceAsArray: <T>(
  objectOrArray: T | T[] | null | undefined
) => T[];
/**
 * Checks if a string is a valid URL.
 * @param {string} url
 */
export declare const isURL: (url: string) => boolean;
/**
 * Converts delta url to a fusion url
 * @param url
 * @returns
 */
export declare const deltaUrlToFusionUrl: (
  url: string,
  nexusWebBase: string
) => string;
