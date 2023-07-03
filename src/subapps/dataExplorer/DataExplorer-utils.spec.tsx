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
    const expectedPaths = [
      '@id',
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
    ];
    expect(getAllPaths(resources)).toEqual(expectedPaths);
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
        project: 'secret project',
      },
    ];
    const expectedPaths = [
      'name',
      'project',
      '_author',
      '_author.designation',
      '_author.name',
      '_createdAt',
      '_updatedAt',
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
});
