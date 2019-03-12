import { getUserList, getOrderedPermissions, addLeadingSlash, stripBasename } from '..';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';

const identities: Identity[] = [
  {
    '@id': 'http://',
    '@type': 'User',
    realm: 'bbp',
    subject: 'julien',
  },
  {
    '@id': 'http://',
    '@type': 'Group',
    realm: 'bbp',
    group: 'mygroup',
  },
  {
    '@id': 'http://',
    '@type': 'User',
    realm: 'bbp',
    subject: 'kenny',
  },
  {
    '@id': 'http://anonymous.com',
    '@type': 'Anonymous',
  },
  {
    '@id': 'http://',
    '@type': 'Authenticated',
    realm: 'bbp',
  },
];
describe('utils functions', () => {
  describe('getUserList()', () => {
    it('should return a list of users', () => {
      expect(getUserList(identities)).toEqual(['julien', 'kenny']);
    });
    it('should return an empty list', () => {
      expect(getUserList([])).toEqual([]);
    });
  });
  describe('', () => {
    it('should return an ordered list', () => {
      expect(getOrderedPermissions(identities)).toEqual([
        'Anonymous',
        'Authenticated',
        'Group',
        'User',
      ]);
    });
    it('should return an empty list', () => {
      expect(getOrderedPermissions([])).toEqual([]);
    });
    it('should return the empty type at the bottom', () => {
      // @ts-ignore
      const errorIdentities: Identity[] = [
        ...identities,
        { '@id': '', '@type': 'Unknown' },
        ...identities,
      ];
      expect(getOrderedPermissions(errorIdentities)).toEqual([
        'Anonymous',
        'Authenticated',
        'Group',
        'User',
        'Unknown',
      ]);
    });
  });
  describe('stripBasename()', () => {
    it('should keep the path intact when the basename is empty', () => {
      const basename = '';
      const path = '/this-is-a-path';
      expect(stripBasename(basename, path)).toEqual(path);
    });
    it('should keep the path intact when the basename is not at the beginning of the path', () => {
      const basename = 'my-app';  // no leading slash, should be added automatically
      const path = '/fragment/my-app/this-is-a-path';
      expect(stripBasename(basename, path)).toEqual(path);
    });
    it('should strip the basename from a path starting with it', () => {
      const basename = '/my-app';
      const justPath = '/this-is-a-path';
      const path = `${basename}${justPath}`;
      expect(stripBasename(basename, path)).toEqual(justPath);
    });
  });
  describe('addLeadingSlash()', () => {
    it('should keep the path intact if it starts with a slash', () => {
      const path = '/this-is-a-path';
      expect(addLeadingSlash(path)).toEqual(path);
    });
    it('should add a leading slash when the first character is not a slash', () => {
      const path = 'this-is-a-path';
      expect(addLeadingSlash(path)).toEqual(`/${path}`);
    });
  });
});
