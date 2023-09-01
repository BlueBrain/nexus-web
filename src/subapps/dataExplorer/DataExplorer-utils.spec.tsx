import {
  GraphAnalyticsProperty,
  getUniquePathsForProperties,
} from './DataExplorerUtils';
import {
  doesResourceContain,
  getAllPaths,
  checkPathExistence,
} from './PredicateSelector';

describe('DataExplorerSpec-Utils', () => {
  it('shows all paths for resources', () => {
    const resources = [
      {
        '@id': '123',
        distribution: [
          { name: 'foo', label: ['label1', 'label2'] },
          { filename: 'foo2', label: 'label3' },
        ],
      },
      {
        '@id': '123',
        distribution: [
          {
            name: 'foo',
            label: ['label1', 'label2'],
            contentType: [
              { mimeType: 'application/json' },
              {
                mimeType: 'application/csv',
                extension: ['csv'],
                possibleExtensions: ['2', '2'],
              },
            ],
          },
          { filename: 'foo2', label: 'label3' },
        ],
        contributors: {
          name: { firstname: 'Michael', lastname: 'Angelo' },
        },
      },
    ];
    const actual = getAllPaths(resources);
    const expectedPaths = [
      'contributors',
      'contributors.name',
      'contributors.name.firstname',
      'contributors.name.lastname',
      'distribution',
      'distribution.contentType',
      'distribution.contentType.extension',
      'distribution.contentType.mimeType',
      'distribution.contentType.possibleExtensions',
      'distribution.filename',
      'distribution.label',
      'distribution.name',
      '@id',
    ];
    expect(actual).toEqual(expectedPaths);
  });

  it('sorts path starting with underscore at the end of the list', () => {
    const resources = [
      {
        _author: { name: 'Archer', designation: 'spy' },
        name: 'nameValue',
        _createdAt: '12 Jan 2020',
      },
      {
        _updatedAt: 'some time ago',
        name: 'anotherNameValue',
        _createdAt: '12 September 2020',
        _project: 'secret project',
      },
    ];
    const expectedPaths = [
      'name',
      '_createdAt',
      '_project',
      '_updatedAt',

      '_author',
      '_author.designation',
      '_author.name',
    ];
    const receivedPaths = getAllPaths(resources);

    expect(receivedPaths).toEqual(expectedPaths);
  });

  it('checks if path exists in resource', () => {
    const resource = {
      foo: 'some value',
      nullValue: null,
      undefinedValue: undefined,
      emptyString: '',
      emptyArray: [],
      emptyObject: {},
      distribution: [
        {
          name: 'sally',
          label: {
            official: 'official',
            unofficial: 'unofficial',
            emptyArray: [],
            emptyString: '',
            extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
          },
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          label: [
            {
              official: 'official',
              emptyArray: [],
              emptyString: '',
              extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
            },
            {
              official: 'official',
              unofficial: 'unofficial',
              emptyArray: [1],
              extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
            },
          ],
        },
      ],
    };
    expect(checkPathExistence(resource, 'bar')).toEqual(false);
    expect(checkPathExistence(resource, 'nullValue')).toEqual(true);
    expect(checkPathExistence(resource, 'undefinedValue')).toEqual(true);
    expect(checkPathExistence(resource, 'emptyString')).toEqual(true);
    expect(checkPathExistence(resource, 'emptyArray')).toEqual(true);
    expect(checkPathExistence(resource, 'emptyObject')).toEqual(true);

    expect(checkPathExistence(resource, 'foo')).toEqual(true);
    expect(checkPathExistence(resource, 'foo.xyz')).toEqual(false);
    expect(checkPathExistence(resource, 'foo.distribution')).toEqual(false);

    expect(checkPathExistence(resource, 'distribution')).toEqual(true);
    expect(checkPathExistence(resource, 'distribution.name')).toEqual(true);
    expect(checkPathExistence(resource, 'distribution.name.sillyname')).toEqual(
      false
    );
    expect(
      checkPathExistence(resource, 'distribution.name.sillyname.pancake')
    ).toEqual(false);
    expect(
      checkPathExistence(resource, 'distribution.name.label.pancake')
    ).toEqual(false);
    expect(
      checkPathExistence(resource, 'distribution.label.unofficial')
    ).toEqual(true); // TODO: Add opposite
    expect(
      checkPathExistence(resource, 'distribution.label.extended.prefix')
    ).toEqual(true);
    expect(
      checkPathExistence(resource, 'distribution.label.extended.suffix')
    ).toEqual(true); // Add opposite
    expect(
      checkPathExistence(resource, 'distribution.label.extended.notexisting')
    ).toEqual(false); // Add opposite
    expect(checkPathExistence(resource, 'distribution.foo')).toEqual(false);
    expect(checkPathExistence(resource, 'distribution.emptyArray')).toEqual(
      false
    );
    expect(
      checkPathExistence(resource, 'distribution.label.emptyArray')
    ).toEqual(true);
    expect(
      checkPathExistence(resource, 'distribution.label.emptyString')
    ).toEqual(true); // Add opposite
  });

  it('check if path exists in resource with nested array', () => {
    const resource = {
      distribution: [
        {
          foo: 'foovalue',
          filename: ['filename1'],
        },
        {
          foo: 'foovalue',
        },
      ],
      objPath: {
        filename: ['filename1'],
      },
    };
    expect(
      checkPathExistence(resource, 'distribution.filename', 'exists')
    ).toEqual(true);
    expect(
      checkPathExistence(resource, 'distribution.filename', 'does-not-exist')
    ).toEqual(true);
    expect(
      checkPathExistence(resource, 'objPath.filename', 'does-not-exist')
    ).toEqual(false);
    expect(checkPathExistence(resource, 'objPath.filename', 'exists')).toEqual(
      true
    );
  });

  it('checks if path is missing in resource', () => {
    const resource = {
      foo: 'some value',
      nullValue: null,
      undefinedValue: undefined,
      emptyString: '',
      emptyArray: [],
      emptyObject: {},
      distribution: [
        {
          name: 'sally',
          label: {
            official: 'official',
            unofficial: 'unofficial',
            emptyArray: [],
            emptyString: '',
            extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
          },
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          label: [
            {
              official: 'official',
              emptyArray: [],
              emptyString: '',
              extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
            },
            {
              official: 'official',
              unofficial: 'unofficial',
              emptyArray: [1],
              extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
            },
          ],
        },
      ],
    };
    expect(checkPathExistence(resource, 'bar', 'does-not-exist')).toEqual(true);
    expect(checkPathExistence(resource, 'nullValue', 'does-not-exist')).toEqual(
      false
    );
    expect(
      checkPathExistence(resource, 'undefinedValue', 'does-not-exist')
    ).toEqual(false);
    expect(
      checkPathExistence(resource, 'emptyString', 'does-not-exist')
    ).toEqual(false);
    expect(
      checkPathExistence(resource, 'emptyArray', 'does-not-exist')
    ).toEqual(false);
    expect(
      checkPathExistence(resource, 'emptyObject', 'does-not-exist')
    ).toEqual(false);

    expect(checkPathExistence(resource, 'foo', 'does-not-exist')).toEqual(
      false
    );
    expect(checkPathExistence(resource, 'foo.xyz', 'does-not-exist')).toEqual(
      true
    );
    expect(
      checkPathExistence(resource, 'foo.distribution', 'does-not-exist')
    ).toEqual(true);

    expect(
      checkPathExistence(resource, 'distribution', 'does-not-exist')
    ).toEqual(false);
    expect(
      checkPathExistence(resource, 'distribution.name', 'does-not-exist')
    ).toEqual(false);
    expect(
      checkPathExistence(
        resource,
        'distribution.name.sillyname',
        'does-not-exist'
      )
    ).toEqual(true);
    expect(
      checkPathExistence(
        resource,
        'distribution.name.sillyname.pancake',
        'does-not-exist'
      )
    ).toEqual(true);
    expect(
      checkPathExistence(
        resource,
        'distribution.name.label.pancake',
        'does-not-exist'
      )
    ).toEqual(true);
    expect(
      checkPathExistence(
        resource,
        'distribution.label.unofficial',
        'does-not-exist'
      )
    ).toEqual(true);
    expect(
      checkPathExistence(
        resource,
        'distribution.label.official',
        'does-not-exist'
      )
    ).toEqual(false);
    expect(
      checkPathExistence(
        resource,
        'distribution.label.extended.prefix',
        'does-not-exist'
      )
    ).toEqual(false);
    expect(
      checkPathExistence(
        resource,
        'distribution.label.extended.suffix',
        'does-not-exist'
      )
    ).toEqual(true);
    expect(
      checkPathExistence(
        resource,
        'distribution.label.extended.notexisting',
        'does-not-exist'
      )
    ).toEqual(true);
    expect(
      checkPathExistence(resource, 'distribution.foo', 'does-not-exist')
    ).toEqual(true);
    expect(
      checkPathExistence(resource, 'distribution.emptyArray', 'does-not-exist')
    ).toEqual(true);
    expect(
      checkPathExistence(
        resource,
        'distribution.label.emptyArray',
        'does-not-exist'
      )
    ).toEqual(false);
    expect(
      checkPathExistence(
        resource,
        'distribution.label.emptyString',
        'does-not-exist'
      )
    ).toEqual(true);
  });

  it('checks if array strings can be checked for contains', () => {
    const resource = {
      '@id':
        'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
      '@type': ['ElasticSearchView', 'View'],
    };
    expect(doesResourceContain(resource, '@type', '')).toEqual(true);
    expect(doesResourceContain(resource, '@type', 'ElasticSearchView')).toEqual(
      true
    );
    expect(doesResourceContain(resource, '@type', 'File')).toEqual(false);
  });

  it('checks if path has a specific value', () => {
    const resource = {
      foo: 'some value',
      bar: 42,
      distribution: [
        {
          name: 'sally',
          filename: 'billy',
          label: {
            official: 'official',
            unofficial: 'rebel',
            extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
          },
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          filename: 'bolly',
          label: [
            {
              official: 'official',
              extended: [{ prefix: '1', suffix: 2 }, { prefix: '1' }],
            },
            {
              official: 'official',
              unofficial: 'rebel',
              extended: [{ prefix: 1, suffix: '2' }, { prefix: '1' }],
            },
          ],
        },
      ],
    };
    expect(doesResourceContain(resource, 'foo', '')).toEqual(true);
    expect(doesResourceContain(resource, 'foo', 'some value')).toEqual(true);
    expect(doesResourceContain(resource, 'foo', '2')).toEqual(false);
    expect(doesResourceContain(resource, 'bar', '42')).toEqual(true);
    expect(doesResourceContain(resource, 'distribution.name', 'sally')).toEqual(
      true
    );
    expect(
      doesResourceContain(resource, 'distribution.sillyname', 'sally')
    ).toEqual(false);
    expect(
      doesResourceContain(resource, 'distribution.filename', 'billy')
    ).toEqual(true);
    expect(
      doesResourceContain(resource, 'distribution.label', 'madeUpLabel')
    ).toEqual(false);
    expect(
      doesResourceContain(resource, 'distribution.official', 'official')
    ).toEqual(false);
    expect(
      doesResourceContain(resource, 'distribution.label.official', 'official')
    ).toEqual(true);
    expect(
      doesResourceContain(resource, 'distribution.label.unofficial', 'official')
    ).toEqual(false);
    expect(
      doesResourceContain(resource, 'distribution.label.unofficial', 'rebel')
    ).toEqual(true);
    expect(
      doesResourceContain(resource, 'distribution.label.extended.prefix', '1')
    ).toEqual(true);
    expect(
      doesResourceContain(resource, 'distribution.label.extended.prefix', '10')
    ).toEqual(false);
    expect(
      doesResourceContain(resource, 'distribution.label.extended.suffix', '1')
    ).toEqual(false);
    expect(
      doesResourceContain(resource, 'distribution.label.extended.suffix', '2')
    ).toEqual(true);
    expect(
      doesResourceContain(
        resource,
        'distribution.label.extended.nonexisting',
        '2'
      )
    ).toEqual(false);
  });

  it('ignores case when checking for contains value', () => {
    const resource = {
      distribution: [
        {
          name: 'sally',
          filename: 'billy',
          label: ['ChiPmunK'],
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          filename: 'bolly',
        },
      ],
    };
    expect(
      doesResourceContain(resource, 'distribution.filename', 'BiLLy')
    ).toEqual(true);
    expect(
      doesResourceContain(resource, 'distribution.filename', 'Lilly')
    ).toEqual(false);
    expect(
      doesResourceContain(resource, 'distribution.label', 'chipmunk')
    ).toEqual(true);
  });

  it('checks if value is a substring in existing path when checking for contains', () => {
    const resource = {
      distribution: [
        {
          name: 'sally',
          filename: 'billy',
          label: ['ChiPmunK'],
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          filename: 'bolly',
        },
      ],
    };
    expect(
      doesResourceContain(resource, 'distribution.filename', 'lly')
    ).toEqual(true);
  });

  it('checks if path exists in resource', () => {
    const resource = {
      distribution: [
        {
          name: 'sally',
          filename: 'billy',
          label: ['ChiPmunK'],
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          filename: 'bolly',
          label: { foo: 'foovalut', bar: 'barvalue' },
        },
      ],
    };
    expect(checkPathExistence(resource, 'topLevelNotExisting')).toEqual(false);
  });

  it('checks if resource does not contain value in path', () => {
    const resource = {
      distribution: [
        {
          name: 'sally',
          filename: 'billy',
          label: ['ChiPmunK'],
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          filename: 'bolly',
          label: { foo: 'foovalut', bar: 'barvalue' },
        },
      ],
    };

    expect(
      doesResourceContain(resource, 'distribution', 'sally', 'does-not-contain')
    ).toEqual(true);

    expect(
      doesResourceContain(
        resource,
        'distribution.name',
        'sally',
        'does-not-contain'
      )
    ).toEqual(false);

    expect(
      doesResourceContain(
        resource,
        'distribution.filename',
        'billy',
        'does-not-contain'
      )
    ).toEqual(true);

    expect(
      doesResourceContain(
        resource,
        'distribution.filename',
        'popeye',
        'does-not-contain'
      )
    ).toEqual(true);
  });

  it('checks if resource does not contain value for nested paths', () => {
    const resource = {
      distribution: [
        {
          name: 'sally',
          filename: 'billy',
          label: ['ChiPmunK'],
          nested: [{ prop1: 'value1', prop2: ['value2', 'value3'] }],
        },
        {
          name: 'sally',
          sillyname: 'soliloquy',
          filename: 'bolly',
          label: { foo: 'foovalut', bar: 'barvalue' },
          nested: [{ prop1: 'value1', prop2: ['value2', 'value5'] }],
        },
      ],
    };

    expect(
      doesResourceContain(
        resource,
        'distribution.label',
        'chipmunk',
        'does-not-contain'
      )
    ).toEqual(true);

    expect(
      doesResourceContain(
        resource,
        'distribution.label',
        'crazy',
        'does-not-contain'
      )
    ).toEqual(true);

    expect(
      doesResourceContain(
        resource,
        'distribution.nested',
        'crazy',
        'does-not-contain'
      )
    ).toEqual(true);

    expect(
      doesResourceContain(
        resource,
        'distribution.nested.prop2',
        'value2',
        'does-not-contain'
      )
    ).toEqual(true); // This is expected since the in the arrays ([`value2`, `value3`] & [`value2`, `value5`]) there is atleast 1 element (`value3` in the 1st array and value5 in the 2nd) that does not contain "value2"

    expect(
      doesResourceContain(
        resource,
        'distribution.nested.prop2',
        'value',
        'does-not-contain'
      )
    ).toEqual(false);

    expect(
      doesResourceContain(
        resource,
        'distribution.nested.prop2',
        'value5',
        'does-not-contain'
      )
    ).toEqual(true);
  });

  it('does not throw when checking for non existence on a path when resource has primitve value', () => {
    const resource = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        {
          '1Point': {
            '@id': 'nsg:1Point',
          },
          '2DContour': {
            '@id': 'nsg:2DContour',
          },
          '3DContour': {
            '@id': 'nsg:3DContour',
          },
          '3Point': {
            '@id': 'nsg:3Point',
          },
          '@vocab':
            'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/',
          Derivation: {
            '@id': 'prov:Derivation',
          },
          xsd: 'http://www.w3.org/2001/XMLSchema#',
        },
      ],
      '@id': 'https://bbp.epfl.ch/nexus/search/neuroshapes',
      _constrainedBy:
        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
      _createdAt: '2019-02-11T14:15:14.020Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/pirman',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/webapps/search-app-prod-public/_/neuroshapes/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/webapps/search-app-prod-public/_/neuroshapes/outgoing',
      _project:
        'https://bbp.epfl.ch/nexus/v1/projects/webapps/search-app-prod-public',
      _rev: 1,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/webapps/search-app-prod-public',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/webapps/search-app-prod-public/_/neuroshapes',
      _updatedAt: '2019-02-11T14:15:14.020Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/pirman',
    };

    expect(
      checkPathExistence(resource, '@context.@vocab', 'does-not-exist')
    ).toEqual(true);
  });

  it('can get paths for propeties with no nesting', () => {
    const mockProperties: GraphAnalyticsProperty[] = [
      {
        _name: 'prop1',
        _properties: [],
      },
      {
        _name: 'prop2',
        _properties: [],
      },
      {
        _name: 'prop3',
        _properties: [],
      },
    ];

    const actualPaths = getUniquePathsForProperties(mockProperties);
    expect(actualPaths).toEqual(['prop1', 'prop2', 'prop3']);
  });

  it('gets paths for 1 level deep nested properties', () => {
    const mockProperties: GraphAnalyticsProperty[] = [
      {
        _name: 'prop1',
        _properties: [{ _name: 'sub1', _properties: [] }],
      },
      {
        _name: 'prop2',
        _properties: [],
      },
      {
        _name: 'prop3',
        _properties: [{ _name: 'sub1', _properties: [] }],
      },
    ];

    const actualPaths = getUniquePathsForProperties(mockProperties);
    expect(actualPaths).toEqual([
      'prop1',
      'prop1.sub1',
      'prop2',
      'prop3',
      'prop3.sub1',
    ]);
  });

  it('gets paths for multi level nested properties', () => {
    const mockProperties: GraphAnalyticsProperty[] = [
      {
        _name: 'who',
        _properties: [
          {
            _name: 'let',
            _properties: [
              {
                _name: 'the',
                _properties: [
                  {
                    _name: 'dogs',
                    _properties: [{ _name: 'out?', _properties: [] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        _name: 'who',
        _properties: [
          { _name: 'who', _properties: [{ _name: 'who?', _properties: [] }] },
        ],
      },
      {
        _name: 'by',
        _properties: [
          { _name: 'baha', _properties: [{ _name: 'men', _properties: [] }] },
        ],
      },
    ];

    const actualPaths = getUniquePathsForProperties(mockProperties);
    expect(actualPaths).toEqual([
      'who',
      'who.let',
      'who.let.the',
      'who.let.the.dogs',
      'who.let.the.dogs.out?',
      'who.who',
      'who.who.who?',
      'by',
      'by.baha',
      'by.baha.men',
    ]);
  });
});
