import {
  getUserList,
  getOrderedPermissions,
  addLeadingSlash,
  stripBasename,
  getLogoutUrl,
  hasExpired,
} from '..';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import { Realm } from '@bbp/nexus-sdk-legacy';

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
      const basename = 'my-app'; // no leading slash, should be added automatically
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
  describe('getLogoutUrl()', () => {
    const identities: Identity[] = [
      { '@id': '1', '@type': 'Authenticated', realm: 'bbp' },
      { '@id': '2', '@type': 'User', subject: 'julien' },
    ];

    const realms = [{ label: 'bbp', endSessionEndpoint: 'http://logout' }];
    it('should return the endsession url', () => {
      expect(getLogoutUrl(identities, realms)).toEqual(
        realms[0].endSessionEndpoint
      );
    });
    it('should return an empty string', () => {
      expect(getLogoutUrl(identities, [])).toEqual('');
      expect(getLogoutUrl([], realms)).toEqual('');
      expect(getLogoutUrl([identities[1]], realms)).toEqual('');
    });
  });
  describe('hasExpired()', () => {
    // this is 1987, so unless you time travel and run this test, it will always be in the past
    const past: number = 536457600;
    // this is year 4000, si it unless Nexus is still around in 2000 years, this will always be the future
    const future: number = 64060588800;
    it('should be expired', () => {
      expect(hasExpired(past)).toBeTruthy();
    });
    it('should NOT be expired', () => {
      expect(hasExpired(future)).toBeFalsy();
    });
  });
});
