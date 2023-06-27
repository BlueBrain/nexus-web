import {
  fileResourceWithNoDistribution,
  getMockDistribution,
  getMockResource,
  resourceWithDistributionArray,
  resourceWithDistributionObject,
  resourceWithoutDistrition,
} from '../__mocks__/data_panel_download_resource';
import {
  FilePath,
  pathForChildDistributions,
  pathForTopLevelResources,
  toLocalStorageResources,
} from '../datapanel';

describe('datapanel utilities', () => {
  const orgName = 'orgA';
  const projectName = 'projectA';

  it('serializes resources with no distribution correctly to local storage object', () => {
    const actualLSResources = toLocalStorageResources(
      resourceWithoutDistrition,
      'studios'
    );
    const expectedParentDistributionValue = {
      hasDistribution: false,
      contentSize: 0,
      encodingFormat: 'json',
      label: 'metadata.json',
    };

    expect(actualLSResources.length).toEqual(1);

    expect(actualLSResources[0].localStorageType).toEqual('resource');
    expect(actualLSResources[0]._self).toEqual(resourceWithoutDistrition._self);
    expect(actualLSResources[0].key).toEqual(resourceWithoutDistrition._self);
    expect(actualLSResources[0].project).toEqual(
      resourceWithoutDistrition._project
    );
    expect(actualLSResources[0].type).toEqual([
      resourceWithoutDistrition['@type'],
    ]);
    expect(actualLSResources[0].source).toEqual('studios');
    expect(actualLSResources[0].distribution).toEqual(
      expectedParentDistributionValue
    );
  });

  it('serializes resource of type file with no distribution correctly', () => {
    const actualLSResources = toLocalStorageResources(
      fileResourceWithNoDistribution,
      'my-data'
    );
    expect(actualLSResources.length).toEqual(1);
    const expectedParentDistributionValue = {
      hasDistribution: false,
      contentSize: fileResourceWithNoDistribution._bytes,
      encodingFormat: fileResourceWithNoDistribution._mediaType,
      label: fileResourceWithNoDistribution._filename,
    };
    expect(actualLSResources[0].distribution).toEqual(
      expectedParentDistributionValue
    );
    expect(actualLSResources[0].source).toEqual('my-data');
  });

  it('serializes resources with distribution array correctly to local storage object', () => {
    const resource = resourceWithDistributionArray;
    const serializedItems = toLocalStorageResources(resource, 'studios');

    expect(serializedItems.length).toEqual(5);
    const actualParentDistributionValue = serializedItems[0].distribution;
    const expectedParentDistributionValue = {
      hasDistribution: true,
      contentSize: 0,
      encodingFormat: 'json',
      label: 'metadata.json',
    };

    expect(actualParentDistributionValue).toEqual(
      expectedParentDistributionValue
    );
  });

  it('serializes resources with arrays for name correctly', () => {
    const resource = {
      ...resourceWithDistributionArray,
      label: undefined,
      name: ['Sterling', 'Malory', 'Archer'],
    };
    const serializedItems = toLocalStorageResources(resource, 'studios');

    expect(serializedItems.length).toEqual(5);
    expect(serializedItems[0].name).toEqual('Sterling-Malory-Archer');
  });

  it('serializes correct distribution value for each distribution item in array', () => {
    const resource = resourceWithDistributionArray;
    const serializedItems = toLocalStorageResources(resource, 'studios');

    const originalDistItems = resource.distribution;
    const serializedDistItems = serializedItems.slice(1);
    expect(originalDistItems.length).toEqual(serializedDistItems.length);
    const expectedContentSizes = [15135, 25946, 12821, 26079];

    serializedDistItems.forEach((actualDistItem, index) => {
      const expectedDistributionValue = {
        hasDistribution: true,
        contentSize: expectedContentSizes[index],
        encodingFormat: originalDistItems[index].encodingFormat,
        label: originalDistItems[index].name,
      };
      expect(actualDistItem.localStorageType).toEqual('distribution');
      expect(actualDistItem.distribution).toEqual(expectedDistributionValue);
      expect(actualDistItem._self).toEqual(resource._self);
      expect(actualDistItem.key).toEqual(`${resource._self}-${index}`);
    });
  });

  it('serializes resources with distribution objects correctly', () => {
    const resource = resourceWithDistributionObject;
    const actualSerializedItems = toLocalStorageResources(resource, 'studios');

    expect(actualSerializedItems.length).toEqual(2);

    const expectedDistributionValueForParent = {
      hasDistribution: true,
      contentSize: 0,
      encodingFormat: 'json',
      label: 'metadata.json',
    };
    expect(actualSerializedItems[0].distribution).toEqual(
      expectedDistributionValueForParent
    );
    expect(actualSerializedItems[0].localStorageType).toEqual('resource');

    const expectedDistributionValueForChild = {
      hasDistribution: true,
      contentSize: 15135,
      encodingFormat: 'text/turtle',
      label: 'molecular-systems.ttl',
    };
    expect(actualSerializedItems[1].distribution).toEqual(
      expectedDistributionValueForChild
    );
    expect(actualSerializedItems[1]._self).toEqual(resource._self);
    expect(actualSerializedItems[1].key).toEqual(resource._self);
    expect(actualSerializedItems[1].project).toEqual(resource._project);
    expect(actualSerializedItems[1].localStorageType).toEqual('distribution');
  });

  it('serializes resources with distribution object when content size is number', () => {
    const resource = {
      ...resourceWithDistributionObject,
      distribution: {
        ...resourceWithDistributionObject.distribution,
        contentSize: 123,
      },
    };
    const actualSerializedItems = toLocalStorageResources(resource, 'studios');

    expect(actualSerializedItems[1].distribution?.contentSize).toEqual(123);
  });

  it('sums up content size for distribution item when it is an array', () => {
    const resource = {
      ...resourceWithDistributionObject,
      distribution: {
        ...resourceWithDistributionObject.distribution,
        contentSize: [10, 20],
      },
    };
    const actualSerializedItems = toLocalStorageResources(resource, 'studios');

    expect(actualSerializedItems[1].distribution?.contentSize).toEqual(30);
  });

  it('serializes resources when distribution is empty array', () => {
    const resource = { ...resourceWithoutDistrition, distribution: [] };
    const actualSerializedItems = toLocalStorageResources(resource, 'studios');

    expect(actualSerializedItems.length).toEqual(1);
    const expectedDistributionValue = {
      hasDistribution: true,
      contentSize: 0,
      encodingFormat: 'json',
      label: 'metadata.json',
    };

    expect(actualSerializedItems[0].distribution).toEqual(
      expectedDistributionValue
    );
  });

  // TODO-NOW: Remove skip when rebased on latest develop
  it('serializes resources when distribution is empty object', () => {
    const resource = { ...resourceWithoutDistrition, distribution: {} };
    const actualSerializedItems = toLocalStorageResources(resource, 'studios');

    expect(actualSerializedItems.length).toEqual(2);
    expect(actualSerializedItems[0].distribution).toBeDefined();
  });

  it('calculates path for top level resource based on its name', () => {
    const resourceName = 'brain-region-1';
    const mockResource = getMockResource(
      resourceName,
      'resource',
      orgName,
      projectName
    );
    const actualPathProps = pathForTopLevelResources(mockResource, new Map());

    const expectPathProps: FilePath = {
      path: `/${orgName}/${projectName}/${resourceName}`,
      filename: 'metadata',
      extension: 'json',
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });

  it('encodes path for top level resource when its name has special uri characters', () => {
    const resourceName = 'brain#reg/ion';
    const mockResource = getMockResource(
      resourceName,
      'resource',
      orgName,
      projectName
    );
    const actualPathProps = pathForTopLevelResources(mockResource, new Map());

    const expectPathProps: FilePath = {
      path: `/${orgName}/${projectName}/${encodeURIComponent(resourceName)}`,
      filename: 'metadata',
      extension: 'json',
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });

  it('does not trim path for top level resource even if it is long', () => {
    const namePrefix = Array(20)
      .fill('A')
      .join('');
    const nameSuffix = Array(20)
      .fill('B')
      .join('');
    const resourceName = `${namePrefix}${nameSuffix}`;

    const mockResource = getMockResource(
      resourceName,
      'resource',
      orgName,
      projectName
    );
    const actualPathProps = pathForTopLevelResources(mockResource, new Map());

    const expectPathProps: FilePath = {
      path: `/${orgName}/${projectName}/${resourceName}`,
      filename: 'metadata',
      extension: 'json',
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });

  it('gets correct name for top level resource when it is a File', () => {
    const filename = 'awesome-file';
    const mockResource = {
      ...getMockResource(filename, 'resource', orgName, projectName, 'File'),
      contentType: 'asc',
    };
    const actualPathProps = pathForTopLevelResources(mockResource, new Map());

    const expectPathProps: FilePath = {
      filename,
      path: `/${orgName}/${projectName}/${filename}`,
      extension: mockResource.contentType,
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });

  it('suffixes index at the end when there are conflicting paths', () => {
    const resourceName = 'brain-region';
    const mockResource = getMockResource(
      resourceName,
      'resource',
      orgName,
      projectName
    );

    const conflictingPath = `/${orgName}/${projectName}/${resourceName}`;
    const pathFrequency = 2;

    const actualPathProps = pathForTopLevelResources(
      mockResource,
      new Map([[conflictingPath, pathFrequency]])
    );

    const expectPathProps: FilePath = {
      path: `/${orgName}/${projectName}/${resourceName}-${pathFrequency}`,
      filename: 'metadata',
      extension: 'json',
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });

  it('gets correct path for distribution items', () => {
    const parentPath = `/${orgName}/${projectName}/parentPath`;
    const filename = 'awesome-file.asc';
    const mockResource = getMockDistribution(filename);
    const actualPathProps = pathForChildDistributions(
      mockResource,
      parentPath,
      new Map()
    );

    const expectPathProps = {
      path: `${parentPath}/awesome-file`,
      fileName: filename,
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });

  it('suffixes index at the end of the path when there is a conflict', () => {
    const parentPath = `/${orgName}/${projectName}/parentPath`;

    const conflictingName = 'awesome-file';

    const filename = `${conflictingName}.asc`;
    const mockResource = getMockDistribution(filename);
    const actualPathProps = pathForChildDistributions(
      mockResource,
      parentPath,
      new Map([[`${parentPath}/awesome-file`, 2]])
    );

    const expectPathProps = {
      path: `${parentPath}/awesome-file-2`,
      fileName: filename,
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });

  it('trims distribution path if it is too long', () => {
    const parentPath = `/${orgName}/${projectName}/parentPath`;
    const namePrefix = Array(20)
      .fill('A')
      .join('');
    const nameSuffix = Array(20)
      .fill('B')
      .join('');
    const filename = `${namePrefix}${nameSuffix}.asc`;
    const mockResource = getMockDistribution(filename);
    const actualPathProps = pathForChildDistributions(
      mockResource,
      parentPath,
      new Map()
    );

    const expectPathProps = {
      path: `${parentPath}/${namePrefix}${nameSuffix}`,
      fileName: `${namePrefix}${nameSuffix}.asc`,
    };

    expect(actualPathProps).toEqual(expectPathProps);
  });
});
