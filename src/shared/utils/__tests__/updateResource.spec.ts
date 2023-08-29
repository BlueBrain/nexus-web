import { getUpdateResourceFunction } from '../updateResource';
import { createNexusClient } from '@bbp/nexus-sdk';

const nexus = createNexusClient({
  uri: 'https://localhost',
  fetch: {},
});

const orgLabel = 'testOrg';
const projectLabel = 'testProject';
const resourceId = 'testResourceId';

describe('getUpdateResourceFunction() with generic resource', () => {
  const resourceNoType = {
    '@id': 'test',
  };
  const fn = getUpdateResourceFunction(
    nexus,
    1,
    resourceNoType,
    resourceNoType,
    orgLabel,
    projectLabel,
    resourceId
  );
  it('resource with no type should match to generic Resource endpoint', () => {
    expect(
      fn
        .toString()
        .trim()
        .replaceAll('\n', ' ')
        .replaceAll(' ', '')
    ).toMatch(
      `()=>nexus.Resource.update(orgLabel,projectLabel,resourceId,revision,resource)`
    );
  });
});

describe('getUpdateResourceFunction() with Organization type resource', () => {
  const organizationTypeResource = {
    '@id': 'test',
    '@type': 'Organization',
  };
  const fn = getUpdateResourceFunction(
    nexus,
    1,
    organizationTypeResource,
    organizationTypeResource,
    orgLabel,
    projectLabel,
    resourceId
  );
  it('resource with @type including Organization should target Organization endpoint', () => {
    expect(fn.toString()).toMatch(
      'nexus.Organization.update(orgLabel, revision, resource)'
    );
  });
});

describe('getUpdateResourceFunction() with Project type resource', () => {
  const projectTypeResource = {
    '@id': 'test',
    '@type': 'Project',
  };
  const fn = getUpdateResourceFunction(
    nexus,
    1,
    projectTypeResource,
    projectTypeResource,
    orgLabel,
    projectLabel,
    resourceId
  );
  it('resource with @type including Project should target Project endpoint', () => {
    expect(fn.toString()).toMatch(
      'nexus.Project.update(orgLabel, projectLabel, revision, resource)'
    );
  });
});

describe('getUpdateResourceFunction() with Realm type resource', () => {
  const realmTypeResource = {
    '@id': 'test',
    '@type': 'Realm',
  };
  const fn = getUpdateResourceFunction(
    nexus,
    1,
    realmTypeResource,
    realmTypeResource,
    orgLabel,
    projectLabel,
    resourceId
  );
  it('resource with @type including Realm should target Realm endpoint', () => {
    console.log('@@fn.toString()', fn.toString());
    expect(fn.toString()).toMatch(
      `nexus.Realm.update(originalResource["_label"], revision, resource)`
    );
  });
});

describe('getUpdateResourceFunction() with Resolver type resource', () => {
  const resolverTypeResource = {
    '@id': 'test',
    '@type': 'Resolver',
  };
  const fn = getUpdateResourceFunction(
    nexus,
    1,
    resolverTypeResource,
    resolverTypeResource,
    orgLabel,
    projectLabel,
    resourceId
  );
  it('resource with @type including Resolver should target Resolver endpoint', () => {
    expect(fn.toString()).toMatch(
      `() => nexus.Resolver.update(
        orgLabel,
        projectLabel,
        resourceId,
        revision,
        resource
      )`
    );
  });
});
describe('getUpdateResourceFunction() with Schema type resource', () => {
  const schemaTypeResource = {
    '@id': 'test',
    '@type': 'Schema',
  };
  const fn = getUpdateResourceFunction(
    nexus,
    1,
    schemaTypeResource,
    schemaTypeResource,
    orgLabel,
    projectLabel,
    resourceId
  );
  it('resource with @type including Schema should target Schema endpoint', () => {
    const expected = `() => nexus.Schema.update(
        orgLabel,
        projectLabel,
        resourceId,
        revision,
        resource
      )`;
    expect(fn.toString()).toMatch(expected);
  });
});

describe('getUpdateResourceFunction() with Storage type resource', () => {
  const Storage = {
    '@id': 'test',
    '@type': 'Storage',
  };
  const fn = getUpdateResourceFunction(
    nexus,
    1,
    Storage,
    Storage,
    orgLabel,
    projectLabel,
    resourceId
  );
  it('resource with @type including Storage should target Storage endpoint', () => {
    expect(
      fn
        .toString()
        .trim()
        .replaceAll('\n', ' ')
        .replaceAll(' ', '')
    ).toMatch(
      `()=>nexus.Storage.update(orgLabel,projectLabel,resourceId,revision,resource)`
    );
  });
});

describe('getUpdateResourceFunction() with unexpected types', () => {
  const resourceWithMultipleTypes = {
    '@id': 'test',
    '@type': ['Storage', 'Schema'],
  };

  it('resource with multiple Nexus reserved types should error', () => {
    expect(() =>
      getUpdateResourceFunction(
        nexus,
        1,
        resourceWithMultipleTypes,
        resourceWithMultipleTypes,
        orgLabel,
        projectLabel,
        resourceId
      )
    ).toThrow();
  });

  const resourceWithFileType = {
    '@id': 'test',
    '@type': ['File'],
  };

  it('resource with type File is not implemented and should error', () => {
    expect(() =>
      getUpdateResourceFunction(
        nexus,
        1,
        resourceWithFileType,
        resourceWithFileType,
        orgLabel,
        projectLabel,
        resourceId
      )
    ).toThrow();
  });

  it('resource with type change should error', () => {
    expect(() =>
      getUpdateResourceFunction(
        nexus,
        1,
        {
          '@type': ['Schema'],
        },
        {
          '@type': ['Storage'],
        },
        orgLabel,
        projectLabel,
        resourceId
      )
    ).toThrow();
  });

  it('resource with additional type added should error', () => {
    expect(() =>
      getUpdateResourceFunction(
        nexus,
        1,
        {
          '@type': ['Schema'],
        },
        {
          '@type': ['Storage', 'Schema'],
        },
        orgLabel,
        projectLabel,
        resourceId
      )
    ).toThrow();
  });

  it('resource with addition of reserved type should error', () => {
    expect(() =>
      getUpdateResourceFunction(
        nexus,
        1,
        {
          '@type': ['Schema'],
        },
        {
          '@type': [],
        },
        orgLabel,
        projectLabel,
        resourceId
      )
    ).toThrow();
  });

  it('resource with removal of reserved type should error', () => {
    expect(() =>
      getUpdateResourceFunction(
        nexus,
        1,
        {
          '@type': [],
        },
        {
          '@type': ['Schema'],
        },
        orgLabel,
        projectLabel,
        resourceId
      )
    ).toThrow();
  });

  it('resource with removal of type property on a resource with a reserved type should use orginal resource type', () => {
    const fn = getUpdateResourceFunction(
      nexus,
      1,
      {},
      {
        '@type': ['Storage'],
      },
      orgLabel,
      projectLabel,
      resourceId
    );
    expect(fn.toString()).toMatch(
      `() => nexus.Storage.update(
        orgLabel,
        projectLabel,
        resourceId,
        revision,
        resource
      )`
    );
  });
});
