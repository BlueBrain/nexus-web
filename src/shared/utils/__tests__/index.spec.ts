import { Identity, Resource } from '@bbp/nexus-sdk';
import {
  getUserList,
  getOrderedPermissions,
  addLeadingSlash,
  stripBasename,
  getLogoutUrl,
  hasExpired,
  camelCaseToLabelString,
  camelCaseToTitleCase,
  matchResultUrls,
  isISODate,
  matchPlugins,
} from '..';

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
  describe('camelCaseToTitleCase()', () => {
    it('should convert camelCase strings to Title Case', () => {
      expect(camelCaseToTitleCase('helloWorld')).toEqual('Hello World');
      expect(camelCaseToTitleCase('iLoveTheUSA')).toEqual('I Love The USA');
    });
  });
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
  describe('camelCaseToLabelString()', () => {
    const camelCaseString = 'somethingWonderful';
    const notCamelCase = 'What is going on';
    const almostCamelCase = 'FineAnyway';
    it('should format a camelCaseString to Camel Case String', () => {
      expect(camelCaseToLabelString(camelCaseString)).toEqual(
        'Something Wonderful'
      );
    });
    it('just return the original string', () => {
      expect(camelCaseToLabelString(notCamelCase)).toEqual(notCamelCase);
    });
    it('should format the almost CamelCaseString anyway', () => {
      expect(camelCaseToLabelString(almostCamelCase)).toEqual('Fine Anyway');
    });
  });

  describe('matchResultUrls()', () => {
    const projectUrl = 'https://bbpnexus.com/v1/projects/public/graphql-ld';
    const resourceUrl =
      'https://bbpnexus.com/v1/resources/public/graphql-ld/_/https:%2F%2Fbluebrainnexus.io%2Fstudio%2Fcontext';

    const fileUrl =
      'https://bbpnexus.com/v1/files/bbp/nmc/2083e07e-7202-4ceb-9b4e-8eddadb2f646';

    const specialSchemaUrl =
      'https://dev.nexus.ocp.bbp.epfl.ch/v1/resources/bbp/nmc/datashapes:dataset/reconstructedcell%2F6d43684a-f33d-4a99-9c25-eecd108c1237';
    const noMatchUrl =
      'https://bluebrain.github.io/nexus/schemas/unconstrained.json';
    it('should match a project url', () => {
      expect(matchResultUrls(projectUrl)).toEqual('public/graphql-ld');
    });

    it('should match a resource url', () => {
      expect(matchResultUrls(resourceUrl)).toEqual(
        '/public/graphql-ld/resources/https:%2F%2Fbluebrainnexus.io%2Fstudio%2Fcontext'
      );
    });

    it('should match a resource url with special schema', () => {
      expect(matchResultUrls(specialSchemaUrl)).toEqual(
        '/bbp/nmc/resources/reconstructedcell%2F6d43684a-f33d-4a99-9c25-eecd108c1237'
      );
    });

    it('should match a file url', () => {
      expect(matchResultUrls(fileUrl)).toEqual(
        `/bbp/nmc/resources/2083e07e-7202-4ceb-9b4e-8eddadb2f646`
      );
    });

    it('return the input when no match is found', () => {
      expect(matchResultUrls(noMatchUrl)).toEqual(
        'https://bluebrain.github.io/nexus/schemas/unconstrained.json'
      );
    });
  });

  describe('isISODate', () => {
    const isoString = '2019-07-29T10:26:06.543Z';
    const otherString = 'randomString';

    it('returns true if a string is an ISO date', () => {
      expect(isISODate(isoString)).toEqual(true);
    });

    it('returns false if a string is not an ISO date', () => {
      expect(isISODate(otherString)).toEqual(false);
    });
  });

  describe('matchPlugins', () => {
    const plugins: string[] = ['plugin1', 'plugin2'];
    const resource: Resource = {
      '@context': 'test',
      '@type': ['type2', 'type1'],
      '@id': 'test',
      _incoming: 'test',
      _outgoing: 'test',
      _self: 'test',
      _constrainedBy: 'test',
      _project: 'test',
      _rev: 1,
      _deprecated: false,
      _createdAt: 'test',
      _createdBy: 'test',
      _updatedAt: 'test',
      _updatedBy: 'test',
    };

    it('matches a resource when pluginsMap has a matching type', () => {
      const pluginsMap = {
        plugin1: {
          '@type': ['type1'],
        },
      };
      expect(matchPlugins(pluginsMap, plugins, resource)).toEqual(['plugin1']);
    });

    it('matches a resource with multiple plugins', () => {
      const pluginsMap = {
        plugin1: {
          '@type': ['type1'],
        },
        plugin2: {
          '@type': ['type2'],
        },
      };
      expect(matchPlugins(pluginsMap, plugins, resource)).toEqual([
        'plugin1',
        'plugin2',
      ]);
    });

    it('does not match a resource when pluginsMap has no matching type', () => {
      const pluginsMap = {
        plugin1: {
          '@type': ['type3'],
        },
      };
      expect(matchPlugins(pluginsMap, plugins, resource)).toEqual([]);
    });
  });
});
