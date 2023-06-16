import {
  fileResourceWithNoDistribution,
  resourceWithDistributionArray,
  resourceWithDistributionObject,
  resourceWithoutDistrition,
} from '../__mocks__/data_panel_download_resource';
import { toLocalStorageResources } from '../datapanel';

describe('ToLocalStorageResources', () => {
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

  it('serializes resources when distribution is empty object', () => {
    const resource = { ...resourceWithoutDistrition, distribution: {} };
    const actualSerializedItems = toLocalStorageResources(resource, 'studios');

    expect(actualSerializedItems.length).toEqual(2);
    expect(actualSerializedItems[0].distribution).toBeDefined();
  });
});
