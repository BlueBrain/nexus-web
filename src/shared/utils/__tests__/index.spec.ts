import { Identity, Resource } from '@bbp/nexus-sdk';
import moment from 'moment';

import {
  addLeadingSlash,
  camelCaseToLabelString,
  camelCaseToTitleCase,
  deltaUrlToFusionUrl,
  forceAsArray,
  getDateString,
  getFriendlyTimeAgoString,
  getLogoutUrl,
  getOrderedPermissions,
  getResourceLabel,
  getUserList,
  hasExpired,
  isISODate,
  makeStudioUri,
  matchPlugins,
  matchResultUrls,
  parseJsonMaybe,
  pluginsExcludeMap,
  pluginsMap,
  stripBasename,
} from '..';
import { getMockResource } from '../__mocks__/data_panel_download_resource';

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
      expect(getLogoutUrl(identities, realms)).toEqual(realms[0].endSessionEndpoint);
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
  describe('dateString()', () => {
    it('should for a date defined with a UTC string should return the same string', () => {
      expect(getDateString(new Date('2022-01-20T09:10:22.149Z'))).toEqual(
        '2022-01-20T09:10:22.149Z'
      );
    });
    it('should for a date defined with a time offset string to return a time in UTC format', () => {
      expect(getDateString(new Date('2022-01-20T09:10:22.149-07:00'))).toEqual(
        '2022-01-20T16:10:22.149Z'
      );
    });
    it('should only include date when optional noTime param is set to true', () => {
      expect(getDateString(new Date('2022-01-20T09:10:22.149Z'), { noTime: true })).toEqual(
        '2022-01-20'
      );
    });
  });
  describe('userFriendlyHistoricalDateString()', () => {
    const now = new Date('2022-01-19T16:43:00Z');

    it('should return "Sometime in the future..." when now is before historicalDate as this isn\'t a valid param', () => {
      const x = new Date('2022-01-19T16:43:34Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('Sometime in the future...');
    });
    it('should return "moments ago" when less than 1 minute has elapsed', () => {
      const x = new Date('2022-01-19T16:42:34Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('moments ago');
    });
    it('should return "1 minute ago" when 1 minute has elapsed (and less than 2 minutes)', () => {
      const x = new Date('2022-01-19T16:42:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('1 minute ago');
    });
    it('should return "4 minutes ago" when 4 minutes have elapsed (and less than 5 minutes)', () => {
      const x = new Date('2022-01-19T16:39:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('4 minutes ago');
    });
    it('should return "1 hour ago" when 1 hour has elapsed', () => {
      const x = new Date('2022-01-19T15:43:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('1 hour ago');
    });
    it('should return "2 hours ago" when 2 hours have elapsed (and less than 3 hours)', () => {
      const x = new Date('2022-01-19T14:21:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('2 hours ago');
    });
    it('should return "1 day ago" when 24 hours have elapsed (and less than 48 hours)', () => {
      const x = new Date('2022-01-18T11:36:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('1 day ago');
    });
    it('should return "2 days ago" when 2 days have elapsed (and less than 3 days)', () => {
      const x = new Date('2022-01-17T11:36:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('2 days ago');
    });
    it('should return "1 month ago" when 31 days have elapsed (and less than 2 months)', () => {
      const x = new Date('2021-12-17T11:36:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('1 month ago');
    });
    it('should return "2 months ago" when 2 months have elapsed (and less than 3 months)', () => {
      const x = new Date('2021-11-17T11:36:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('2 months ago');
    });
    it('should return "1 year ago" when 1 year has elapsed (and less than 2 years)', () => {
      const x = new Date('2020-11-17T11:36:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('1 year ago');
    });
    it('should return "2 years ago" when 2 years have elapsed (and less than 3 years)', () => {
      const x = new Date('2019-11-17T11:36:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('2 years ago');
    });
    it('should accept a moment date object as parameter and work the same as if supplied Date object', () => {
      const x = moment('2019-11-17T11:36:00Z');
      expect(getFriendlyTimeAgoString(x, now)).toEqual('2 years ago');
    });
  });
  describe('camelCaseToLabelString()', () => {
    const camelCaseString = 'somethingWonderful';
    const notCamelCase = 'What is going on';
    const almostCamelCase = 'FineAnyway';
    it('should format a camelCaseString to Camel Case String', () => {
      expect(camelCaseToLabelString(camelCaseString)).toEqual('Something Wonderful');
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

    const fileUrl = 'https://bbpnexus.com/v1/files/bbp/nmc/2083e07e-7202-4ceb-9b4e-8eddadb2f646';

    const specialSchemaUrl =
      'https://dev.nexus.ocp.bbp.epfl.ch/v1/resources/bbp/nmc/datashapes:dataset/reconstructedcell%2F6d43684a-f33d-4a99-9c25-eecd108c1237';
    const noMatchUrl = 'https://bluebrain.github.io/nexus/schemas/unconstrained.json';
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
    const anotherTimeString = '2019-11-21T10:09:49.531037';

    it('returns true if a string is an ISO date', () => {
      expect(isISODate(isoString)).toEqual(true);
    });

    it('returns true if a string is an ISO date', () => {
      expect(isISODate(anotherTimeString)).toEqual(true);
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

    const resourceWithNonArrayType: Resource = {
      '@context': 'test',
      '@type': 'type2',
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

    const imageResource: Resource = {
      '@context': 'test',
      '@type': ['type2', 'type1'],
      '@id': 'test',
      image: {},
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

    const distributionResource: Resource = {
      '@context': 'test',
      '@type': ['type2', 'type1'],
      '@id': 'test',
      distribution: [],
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

    it('matches a resource when pluginsExcludedMap has a type', () => {
      const pluginsExcludedMap = {
        plugin1: {
          '@type': ['type1'],
        },
      };
      expect(matchPlugins(pluginsExcludedMap, plugins, resource)).toEqual(['plugin1']);
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
      expect(matchPlugins(pluginsMap, plugins, resource)).toEqual(['plugin1', 'plugin2']);
    });

    it('matches a resource when resorce @type is not an array', () => {
      const pluginsMap = {
        plugin1: {
          '@type': ['type1'],
        },
        plugin2: {
          '@type': ['type2'],
        },
      };
      expect(matchPlugins(pluginsMap, plugins, resourceWithNonArrayType)).toEqual(['plugin2']);
    });

    it('does not match a resource when pluginsMap has no matching type', () => {
      const pluginsMap = {
        plugin1: {
          '@type': ['type3'],
        },
      };
      expect(matchPlugins(pluginsMap, plugins, resource)).toEqual([]);
    });

    it('matches a resource with multiple plugins', () => {
      const plugins: string[] = ['morphology', 'morphology2'];
      const pluginsMap = {
        morphology: {
          '@type': ['ReconstructedCell'],
          distribution: [
            {
              encodingFormat: 'application/swc',
            },
          ],
        },
      };
      const resource = {
        '@context': [
          'https://bbp.neuroshapes.org',
          'https://bluebrain.github.io/nexus/contexts/resource.json',
        ],
        '@id':
          'https://bbp.epfl.ch/neurosciencegraph/data/reconstructedcell/a9f73e3e-33c9-4f45-94a7-5d4f925afc57',
        '@type': [
          'Entity',
          'InVitroSliceReconstructedPatchedNeuron',
          'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
          'ReconstructedPatchedCell',
          'ReconstructedCell',
          'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
          'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
          'Dataset',
        ],
        distribution: [
          {
            '@type': 'DataDownload',
            contentSize: {
              unitCode: 'bytes',
              value: 245427,
            },
            contentUrl:
              'https://bbp.epfl.ch/neurosciencegraph/data/a91043da-0527-4414-b7e8-3484d426c11f',
            digest: {
              algorithm: 'SHA-256',
              value: '02c666b5ba8ba806470f77f52b5b6b105662bc63f8b3f2da9a560af0bbc6fc07',
            },
            encodingFormat: 'application/swc',
            name: 'file',
          },
          {
            '@type': 'DataDownload',
            contentUrl: 'http://microcircuits.epfl.ch/#/article/article_3_mph',
            repository: {
              '@id': 'http://microcircuits.epfl.ch/#/article/article_3_mph',
            },
          },
        ],
      };
      expect(matchPlugins(pluginsMap, plugins, resource as Resource<any>)).toEqual(['morphology']);
    });

    it('returns plugin mappings array from manifest', () => {
      const manifest = {
        'sim-writer-config': {
          modulePath: 'sim-writer-config.66e2aa60be278e26091a.js',
          name: 'Sim writer config',
          description: '',
          version: '',
          tags: [],
          author: '',
          license: '',
          mapping: {
            '@type': ['SimWriterConfiguration'],
          },
        },
        'simulation-campaign': {
          modulePath: 'simulation-campaign.11f235ae73390d34a43b.js',
          name: 'Simulation campaign',
          description: '',
          version: '',
          tags: [],
          author: '',
          license: '',
          mapping: {
            '@type': ['SimulationCampaign'],
          },
        },
      };
      expect(pluginsMap(manifest)).toEqual({
        'sim-writer-config': { '@type': ['SimWriterConfiguration'] },
        'simulation-campaign': { '@type': ['SimulationCampaign'] },
      });
    });

    it('matches a resource with multiple mappings', () => {
      const plugins: string[] = ['imagePlugin'];
      const pluginsMap = {
        imagePlugin: {
          '@type': 'File',
          _mediaType: ['image/png', 'image/jpeg'],
        },
      };
      const resource = {
        '@context': 'https://bluebrain.github.io/nexus/contexts/resource.json',
        '@id': 'https://bbp.epfl.ch/neurosciencegraph/data/f53c7f5e-ce6d-4211-ad75-cf524de4e57c',
        '@type': 'File',
        _bytes: 203534,
        _digest: {
          _value: '236ba60cda6dfa3cf7a33fdd82b814ebf68f46650c3c9689e8ad4eb7eca2e810',
          _algorithm: 'SHA-256',
        },
        _filename: 'P14-12n30.jpg',
        _mediaType: 'image/jpeg',
        _storage: {
          '@id': 'nxv:diskStorageDefault',
          _rev: 1,
        },
        _self:
          'https://bbp.epfl.ch/nexus/v1/files/bbp/somatosensorycortex/f53c7f5e-ce6d-4211-ad75-cf524de4e57c',
        _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/file.json',
        _project: 'https://bbp.epfl.ch/nexus/v1/projects/bbp/somatosensorycortex',
        _rev: 1,
        _deprecated: false,
        _createdAt: '2019-09-26T09:49:56.981669Z',
        _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kenny',
        _updatedAt: '2019-09-26T09:49:56.981669Z',
        _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kenny',
        _incoming:
          'https://bbp.epfl.ch/nexus/v1/files/bbp/somatosensorycortex/f53c7f5e-ce6d-4211-ad75-cf524de4e57c/incoming',
        _outgoing:
          'https://bbp.epfl.ch/nexus/v1/files/bbp/somatosensorycortex/f53c7f5e-ce6d-4211-ad75-cf524de4e57c/outgoing',
      };
      expect(matchPlugins(pluginsMap, plugins, resource as Resource<any>)).toEqual(['imagePlugin']);
    });
    it('matches a resource with using regex matching', () => {
      const plugins: string[] = ['regexPlugin'];
      const pluginsMap = {
        regexPlugin: {
          '@type': 'File',
          _filename: ['P14-*'],
        },
      };
      const resource = {
        '@context': 'https://bluebrain.github.io/nexus/contexts/resource.json',
        '@id': 'https://bbp.epfl.ch/neurosciencegraph/data/f53c7f5e-ce6d-4211-ad75-cf524de4e57c',
        '@type': 'File',
        _bytes: 203534,
        _digest: {
          _value: '236ba60cda6dfa3cf7a33fdd82b814ebf68f46650c3c9689e8ad4eb7eca2e810',
          _algorithm: 'SHA-256',
        },
        _filename: 'P14-12n30.jpg',
        _mediaType: 'image/jpeg',
        _storage: {
          '@id': 'nxv:diskStorageDefault',
          _rev: 1,
        },
        _self:
          'https://bbp.epfl.ch/nexus/v1/files/bbp/somatosensorycortex/f53c7f5e-ce6d-4211-ad75-cf524de4e57c',
        _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/file.json',
        _project: 'https://bbp.epfl.ch/nexus/v1/projects/bbp/somatosensorycortex',
        _rev: 1,
        _deprecated: false,
        _createdAt: '2019-09-26T09:49:56.981669Z',
        _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kenny',
        _updatedAt: '2019-09-26T09:49:56.981669Z',
        _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/kenny',
        _incoming:
          'https://bbp.epfl.ch/nexus/v1/files/bbp/somatosensorycortex/f53c7f5e-ce6d-4211-ad75-cf524de4e57c/incoming',
        _outgoing:
          'https://bbp.epfl.ch/nexus/v1/files/bbp/somatosensorycortex/f53c7f5e-ce6d-4211-ad75-cf524de4e57c/outgoing',
      };
      expect(matchPlugins(pluginsMap, plugins, resource as Resource<any>)).toEqual(['regexPlugin']);
    });

    it('matches a resource with nested objects in arrays', () => {
      const plugins: string[] = ['complexPlugin'];
      const pluginsMap = {
        complexPlugin: {
          '@type': 'File',
          exoticProperty: [
            {
              name: 'Property1',
              '@type': ['a'],
            },
            {
              name: 'Property2',
              '@type': ['c'],
            },
          ],
        },
      };
      const resource = {
        '@context': 'https://bluebrain.github.io/nexus/contexts/resource.json',
        '@id': 'https://bbp.epfl.ch/neurosciencegraph/data/f53c7f5e-ce6d-4211-ad75-cf524de4e57c',
        '@type': 'File',
        exoticProperty: [
          {
            name: 'Property1',
            '@type': ['a', 'b'],
          },
        ],
      };

      expect(matchPlugins(pluginsMap, plugins, resource as Resource<any>)).toEqual([
        'complexPlugin',
      ]);
    });

    it('does not matches a resource with unmatching nested objects in arrays', () => {
      const plugins: string[] = ['complexPlugin'];
      const pluginsMap = {
        complexPlugin: {
          '@type': 'File',
          exoticProperty: [
            {
              name: 'Property1',
              '@type': ['a', 'b'],
            },
          ],
        },
      };
      const resource = {
        '@context': 'https://bluebrain.github.io/nexus/contexts/resource.json',
        '@id': 'https://bbp.epfl.ch/neurosciencegraph/data/f53c7f5e-ce6d-4211-ad75-cf524de4e57c',
        '@type': 'File',
        exoticProperty: [
          {
            name: 'Property1',
            '@type': ['c'],
          },
        ],
      };
      expect(matchPlugins(pluginsMap, plugins, resource as Resource<any>)).toEqual([]);
    });

    it('matches multiple resources with different shapes', () => {
      const pluginsMap = {
        plugin1: [
          {
            '@type': ['type1'],
            image: {},
          },
          {
            '@type': ['type1'],
            distribution: {},
          },
        ],
      };
      expect(matchPlugins(pluginsMap, plugins, imageResource)).toEqual(['plugin1']);
      expect(matchPlugins(pluginsMap, plugins, distributionResource)).toEqual(['plugin1']);
    });
  });

  describe('pluginToExclude', () => {
    const manifestWithPluginsToExclude = {
      'sim-writer-config': {
        modulePath: 'sim-writer-config.66e2aa60be278e26091a.js',
        name: 'Sim writer config',
        description: '',
        version: '',
        tags: [],
        author: '',
        license: '',
        mapping: {
          '@type': ['SimWriterConfiguration'],
        },
        exclude: {
          '@type': ['Dataset'],
        },
      },
      'simulation-campaign': {
        modulePath: 'simulation-campaign.11f235ae73390d34a43b.js',
        name: 'Simulation campaign',
        description: '',
        version: '',
        tags: [],
        author: '',
        license: '',
        mapping: {
          '@type': ['SimulationCampaign'],
        },
      },
    };

    it('returns plugin mappings array of plugins to exclude', () => {
      expect(pluginsExcludeMap(manifestWithPluginsToExclude)).toEqual({
        'sim-writer-config': { '@type': ['Dataset'] },
      });
    });
  });

  describe('makeStudioUri', () => {
    it('returns studio uri with encoded studio id', () => {
      const orgLabel = 'org';
      const projectLabel = 'project';
      const studioId = 'https://someId';
      const studioUri = '/org/project/studios/https%3A%2F%2FsomeId';

      expect(makeStudioUri(orgLabel, projectLabel, studioId)).toEqual(studioUri);
    });
  });

  describe('parseJsonMaybe()', () => {
    it('returns parsed JSON from a json string', () => {
      const test = {
        banana: 'fruit',
      };
      expect(parseJsonMaybe(JSON.stringify(test))).toEqual(test);
    });

    it('gracefully returns a null object if the JSON is bad', () => {
      expect(parseJsonMaybe('')).toBe(null);
      expect(parseJsonMaybe('thisisnotjson')).toBe(null);
      expect(parseJsonMaybe(undefined)).toBe(null);
    });
  });

  describe('deltaUrlToFusionUrl()', () => {
    it('returns the fusion url from a delta file url', () => {
      const base = '/web';
      const deltaUrl =
        'https://delta.bbp.epfl.ch/v1/files/bbp/somatosensorycortex/f53c7f5e-ce6d-4211-ad75-cf524de4e57c';
      const fusionUrl =
        '/web/orgs/bbp/somatosensorycortex/https%3A%2F%2Fdelta.bbp.epfl.ch%2Fv1%2Ffiles%2Fbbp%2Fsomatosensorycortex%2Ff53c7f5e-ce6d-4211-ad75-cf524de4e57c';
      expect(deltaUrlToFusionUrl(deltaUrl, base)).toEqual(fusionUrl);
    });
    it('returns the fusion url from a delta resource url', () => {
      const base = '/web';
      const deltaUrl =
        'https://delta.bbp.epfl.ch/v1/resources/bbp/somatosensorycortex/_/f53c7f5e-ce6d-4211-ad75-cf524de4e57c';
      const fusionUrl =
        '/web/orgs/bbp/somatosensorycortex/https%3A%2F%2Fdelta.bbp.epfl.ch%2Fv1%2Fresources%2Fbbp%2Fsomatosensorycortex%2F_%2Ff53c7f5e-ce6d-4211-ad75-cf524de4e57c';
      expect(deltaUrlToFusionUrl(deltaUrl, base)).toEqual(fusionUrl);
    });
    it('returns the fusion url from a delta project url', () => {
      const base = '/web';
      const deltaUrl = 'http://localhost:8080/v1/projects/myorg/myproject';
      const fusionUrl = '/web/orgs/myorg/myproject';
      expect(deltaUrlToFusionUrl(deltaUrl, base)).toEqual(fusionUrl);
    });
    it('does not modify non delta url', () => {
      const base = '/web';
      const inputUrl = 'https://www.google.com/';
      const outputUrl = 'https://www.google.com/';
      expect(deltaUrlToFusionUrl(inputUrl, base)).toEqual(outputUrl);
    });
  });

  describe('forceAsArray()', () => {
    it('returns an array if the input is an object', () => {
      expect(forceAsArray({ thing: 1 })).toEqual([{ thing: 1 }]);
      expect(forceAsArray({ thing: 1 })).not.toEqual([]);
    });
    it('returns an array if the input is an array', () => {
      expect(forceAsArray([{ thing: 1 }])).toEqual([{ thing: 1 }]);
      expect(forceAsArray({ thing: 1 })).not.toEqual([]);
    });
    it('returns an empty array if the input is null or undefined', () => {
      expect(forceAsArray(null)).toEqual([]);
      expect(forceAsArray(undefined)).toEqual([]);
    });
  });

  describe('getResourceLabel', () => {
    it('uses prefLabel when availablae', () => {
      const expectedLabel = 'ExpectedLabel';

      const actualLabel = getResourceLabel({
        prefLabel: expectedLabel,
        name: 'foo',
        label: 'bar',
        '@id': 'https://abc.com/myid',
        _self: 'https://abc.com/myself',
      } as any);

      expect(actualLabel).toEqual(expectedLabel);
    });

    it('appends name if it is an array', () => {
      const expectedLabel = 'foo-bar';

      const actualLabel = getResourceLabel({
        name: ['foo', 'bar'],
        '@id': 'https://abc.com/myid',
        _self: 'https://abc.com/myself',
      } as any);

      expect(actualLabel).toEqual(expectedLabel);
    });

    it('takes first name if it is an array of one string', () => {
      const expectedLabel = 'foo';

      const actualLabel = getResourceLabel({
        name: ['foo'],
        '@id': 'https://abc.com/myid',
        _self: 'https://abc.com/myself',
      } as any);

      expect(actualLabel).toEqual(expectedLabel);
    });

    it('uses self if id is not available', () => {
      const expectedLabel = 'myself';

      const actualLabel = getResourceLabel({
        _self: 'https://abc.com/myself',
      } as any);

      expect(actualLabel).toEqual(expectedLabel);
    });

    it('gives last part of id after pound sign', () => {
      const expectedLabel = 'myid';

      const actualLabel = getResourceLabel({
        '@id': 'https://abc.com#myid',
      } as any);

      expect(actualLabel).toEqual(expectedLabel);
    });
  });
});
