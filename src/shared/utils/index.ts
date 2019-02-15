import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

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
