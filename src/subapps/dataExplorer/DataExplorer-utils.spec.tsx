import { getAllPaths, isPathMissing } from './PredicateSelector';

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

  it('returns true when top level property does not exist in resource', () => {
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
    expect(isPathMissing(resource, 'bar')).toEqual(true);
    expect(isPathMissing(resource, 'nullValue')).toEqual(false);
    expect(isPathMissing(resource, 'undefinedValue')).toEqual(false);
    expect(isPathMissing(resource, 'emptyString')).toEqual(false);
    expect(isPathMissing(resource, 'emptyArray')).toEqual(false);
    expect(isPathMissing(resource, 'emptyObject')).toEqual(false);

    expect(isPathMissing(resource, 'foo')).toEqual(false);
    expect(isPathMissing(resource, 'foo.xyz')).toEqual(true);
    expect(isPathMissing(resource, 'foo.distribution')).toEqual(true);

    expect(isPathMissing(resource, 'distribution')).toEqual(false);
    expect(isPathMissing(resource, 'distribution.name')).toEqual(false);
    expect(isPathMissing(resource, 'distribution.name.sillyname')).toEqual(
      true
    );
    expect(
      isPathMissing(resource, 'distribution.name.sillyname.pancake')
    ).toEqual(true);
    expect(isPathMissing(resource, 'distribution.name.label.pancake')).toEqual(
      true
    );
    expect(isPathMissing(resource, 'distribution.label.unofficial')).toEqual(
      true
    );
    expect(
      isPathMissing(resource, 'distribution.label.extended.prefix')
    ).toEqual(false);
    expect(
      isPathMissing(resource, 'distribution.label.extended.suffix')
    ).toEqual(true);
    expect(isPathMissing(resource, 'distribution.foo')).toEqual(true);
    expect(isPathMissing(resource, 'distribution.emptyArray')).toEqual(true);
    expect(isPathMissing(resource, 'distribution.label.emptyArray')).toEqual(
      false
    );
    expect(isPathMissing(resource, 'distribution.label.emptyString')).toEqual(
      true
    );
  });
});
