import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';
import { Realm } from '@bbp/nexus-sdk';

/**
 * getProp utility - an alternative to lodash.get
 * @author @harish2704, @muffypl, @pi0
 * @param {Object} object
 * @param {String|Array} path
 * @param {*} defaultVal
 */
export const getProp = function getPropertyWithPath(
  object: any,
  path: string | any[],
  defaultVal: any = null
): any {
  if (!object) {
    return defaultVal;
  }
  const pathArray = Array.isArray(path)
    ? path
    : path.split('.').filter(i => i.length);

  if (!pathArray.length) {
    return object === undefined ? defaultVal : object;
  }
  const newObj = object[pathArray.shift()];
  if (!newObj) {
    return defaultVal;
  }
  return getPropertyWithPath(newObj, pathArray, defaultVal);
};

/**
 * moveTo utility - move an array element to a new index position
 * @author Richard Scarrott
 * @param {Array} array
 * @param {number} from
 * @param {number} to
 */
export const moveTo = function moveArrayElement(
  array: any[],
  from: number,
  to: number
): any[] {
  return array.splice(to, 0, array.splice(from, 1)[0]);
};

/**
 * creates a random UUID
 * @author https://stackoverflow.com/users/109538/broofa
 * @export
 * @returns {string}
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Given an array of identities, returns a list of usernames or []
 *
 * @param {Identity[]} identities an array of identities
 * @returns {string[]} A list of usernames, or an empty array
 */
export const getUserList = (identities: Identity[]) =>
  identities
    .filter(identity => identity['@type'] === 'User')
    .map(identity => identity.subject);

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
export const getOrderedPermissions = (
  identities: Identity[]
): Identity['@type'][] => {
  const permissionWeight: { [key: string]: number } = {
    Anonymous: 1,
    Authenticated: 2,
    Group: 3,
    User: 4,
  };

  const sorted = identities
    .sort(
      (idA, idB) =>
        permissionWeight[idA['@type']] - permissionWeight[idB['@type']]
    )
    .map(identity => identity['@type']);

  return [...new Set(sorted)];
};

export const asyncTimeout = (timeInMilliseconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
};

/**
 * Ensure a path fragment has a leading slash, to compute routes.
 */
export const addLeadingSlash = (path: string) => {
  return path.charAt(0) === '/' ? path : `/${path}`;
};

/**
 * Compute route path without base path.
 *
 * Useful when using MemoryHistory which does not support `basename`.
 *
 * Code taken from react-router StaticRouter component's private methods.
 */
export const stripBasename = (basename: string, path: string) => {
  if (!basename) return path;

  const base = addLeadingSlash(basename);

  if (path.indexOf(base) !== 0) return path;

  return path.substr(base.length);
};

/**
 * Returns a function that adds the basename to a path.
 *
 * If base and path are empty, it returns '/', which is convenient
 * since routing may not handle empty paths properly.
 */
export const buildPathFactory = (base: string) => (path: string = '') => `${base}/${path}`;

// For getting the last part of a uri path as a title or label
export const labelOf = (string: string) => {
  const slash = string.substring(string.lastIndexOf('/') + 1);
  const title = slash.substring(slash.lastIndexOf('#') + 1);
  return title;
};

export const isBrowser = typeof window !== 'undefined';

/**
 * Returns the logout URL of the realm the user is authenticated with
 *
 * @param identities
 * @param realms
 */
export function getLogoutUrl(
  identities: Identity[],
  realms: { label: string; endSessionEndpoint: string }[]
): string {
  // find authenticated Identity and get realm name
  const identity = identities.find(
    identity => identity['@type'] === 'Authenticated'
  );
  if (identity === undefined) {
    return '';
  }

  // find realm with the matching label
  const realm = realms.find(realm => realm.label === identity.realm);
  if (realm === undefined) {
    return '';
  }

  // return logout URL
  return realm.endSessionEndpoint;
}
