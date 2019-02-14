import { getUserList, getOrderedPermissions } from '..';
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
});
