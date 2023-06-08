import { Resource } from '@bbp/nexus-sdk';
import * as Sentry from '@sentry/browser';
import { isArray, isNil, sum } from 'lodash';
import { TDataSource } from '../../shared/molecules/MyDataTable/MyDataTable';
import { fileExtensionFromResourceEncoding } from '../../utils/contentTypes';
import isValidUrl from '../../utils/validUrl';

const getResourceName = (resource: Resource) =>
  resource.name ?? resource['@id'] ?? resource._self;

const baseLocalStorageObject = (
  resource: Resource,
  source: string,
  keySuffix?: string
): Omit<TDataSource, 'distribution'> => {
  return {
    source,
    key: keySuffix ? `${resource._self}-${keySuffix}` : resource._self,
    _self: resource._self,
    id: resource['@id'],
    name: getResourceName(resource),
    project: resource._project,
    description: resource.description ?? '',
    createdAt: resource._createdAt,
    updatedAt: resource._updatedAt,
    type: isArray(resource['@type'])
      ? resource['@type']
      : [resource['@type'] ?? ''],
  };
};

export const toLocalStorageResources = (
  resource: Resource,
  source: string
): TDataSource[] => {
  const resourceName = getResourceName(resource);
  try {
    // Case 1 - Resource has no distribution
    if (isNil(resource.distribution)) {
      return [
        {
          ...baseLocalStorageObject(resource, source),
          localStorageType: 'resource',
          ...(resource['@type'] === 'File' && {
            contentSize: resource._bytes,
            encodingFormat: resource._mediaType,
            label: resource._filename,
            hasDistribution: false,
          }),
        },
      ];
    }

    // Case 2 - Resource has (multiple) distributions in an array
    if (isArray(resource.distribution)) {
      // In case distribution is an array we have to store the main resource,
      // but also an object for every item in the distribution array.
      const localStorageObjs: TDataSource[] = [];

      // First store an object for the parent resource.
      localStorageObjs.push({
        ...baseLocalStorageObject(resource, source),
        localStorageType: 'resource',
        distributionItemsLength: resource.distribution.length,
        distribution: {
          hasDistribution: true,
          contentSize: 0, // So the size in not doubled
          encodingFormat: '',
          label: '',
        },
      });

      // Now store an object for each distribution item
      resource.distribution.forEach((distItem, index) => {
        localStorageObjs.push({
          ...baseLocalStorageObject(resource, source, `${index}`),
          localStorageType: 'distribution',
          distribution: {
            hasDistribution: true, // So, we don't download the distribution twice
            contentSize:
              (distItem.contentSize as { value: number })?.value ??
              distItem.contentSize ??
              0,
            encodingFormat: distItem?.encodingFormat ?? '',
            label: fileNameForDistributionItem(distItem, resourceName),
          },
        });
      });

      return localStorageObjs;
    }

    // Case 3 - resource.distribution is an object with key-value pairs.
    return [
      {
        ...baseLocalStorageObject(resource, source),
        localStorageType: 'resource',
        distribution: {
          hasDistribution: true,
          contentSize: isArray(resource.distribution?.contentSize)
            ? sum(resource.distribution?.contentSize)
            : resource.distribution?.contentSize?.value ??
              resource.distribution?.contentSize ??
              0,
          encodingFormat: isArray(resource.distribution?.encodingFormat)
            ? resource.distribution?.encodingFormat[0]
            : resource.distribution?.encodingFormat ?? '',
          label: fileNameForDistributionItem(
            resource.distribution,
            resourceName
          ),
        },
      },
    ];
  } catch (err) {
    console.log('@error Failed to serialize resource for localStorage.', err);
    Sentry.captureException(err, {
      extra: {
        resource,
        message: 'Failed to serialize resource for localStorage.',
      },
    });
    return [];
  }
};

export const fileNameForDistributionItem = (
  distItem: any,
  defaultName: string
) => {
  const distName: string =
    distItem?.label ??
    distItem?.name ??
    distItem?._filename ??
    distItem?.filename ??
    defaultName;
  // Distribution name has an extension if  it's not a url & it has some text after the last period.
  const distNameHasExtension = Boolean(
    !isValidUrl(distName) &&
      distName.slice(
        distName.includes('.') ? distName.lastIndexOf('.') : distName.length
      )
  );

  if (!Boolean(distItem?.name) || !distNameHasExtension) {
    Sentry.captureException(
      'Distribution item does not have name or extension.',
      {
        extra: { distItem, defaultName },
      }
    );
  }

  const fileName = distNameHasExtension
    ? distName
    : `${distName}.${fileExtensionFromResourceEncoding(
        distItem?.encodingFormat
      )}`;

  return fileName;
};

export const removeLocalStorageRows = (
  rows: TDataSource[],
  keysToRemove: string[]
) => {
  // In addition to removing all localStorage rows whose key match with any `rowKeysToRemove`,
  // we also have to remove all localStorage rows that were saved for the distribution items.
  // These rows have keys like `${_self from parent resource}-${a number}`
  return rows.filter(
    row => !keysToRemove.find(key => row.key.toString().startsWith(key))
  );
};
