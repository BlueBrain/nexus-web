import { Resource } from '@bbp/nexus-sdk';
import * as Sentry from '@sentry/browser';
import { compact, flatMap, isArray, isNil, sum } from 'lodash';
import { TDataSource } from '../../shared/molecules/MyDataTable/MyDataTable';
import { fileExtensionFromResourceEncoding } from '../../utils/contentTypes';
import isValidUrl from '../../utils/validUrl';
import { ResourceObscured } from 'shared/organisms/DataPanel/DataPanel';
import { getResourceLabel } from '.';

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
    name: getResourceLabel(resource),
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
          distribution: {
            hasDistribution: false,
            contentSize: resource['@type'] === 'File' ? resource._bytes : 0,
            encodingFormat:
              resource['@type'] === 'File' ? resource._mediaType : 'json',
            label:
              resource['@type'] === 'File'
                ? resource._filename
                : 'metadata.json',
          },
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
          contentSize: resource['@type'] === 'File' ? resource._bytes : 0,
          encodingFormat:
            resource['@type'] === 'File' ? resource._mediaType : 'json',
          label:
            resource['@type'] === 'File' ? resource._filename : 'metadata.json',
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
      // First store an object for the parent resource.
      {
        ...baseLocalStorageObject(resource, source),
        localStorageType: 'resource',
        distribution: {
          hasDistribution: true,
          contentSize: resource['@type'] === 'File' ? resource._bytes : 0,
          encodingFormat:
            resource['@type'] === 'File' ? resource._mediaType : 'json',
          label:
            resource['@type'] === 'File' ? resource._filename : 'metadata.json',
        },
      },
      // Now store an object for the distribution item.
      {
        ...baseLocalStorageObject(resource, source),
        localStorageType: 'distribution',
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

export const distributionName = (distItem: any, defaultName: string) => {
  const distName: string =
    distItem?.label ??
    distItem?.name ??
    distItem?._filename ??
    distItem?.filename ??
    defaultName;
  return distName;
};

export const fileNameForDistributionItem = (
  distItem: any,
  defaultName: string
) => {
  const distName = distributionName(distItem, defaultName);

  // Distribution name has an extension if  it's not a url & it has some text after the last period.
  const distNameHasExtension = Boolean(
    !isValidUrl(distName) &&
      distName.slice(
        distName.includes('.') ? distName.lastIndexOf('.') : distName.length
      )
  );

  if (!Boolean(distItem?.name) || !distNameHasExtension) {
    Sentry.captureMessage(
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

export const distributionMatchesTypes = (
  distItem: any,
  fileExtenstions: string[]
): boolean => {
  const distributionName = fileNameForDistributionItem(distItem, '');
  const distributionExtension =
    distributionName
      .split('.')
      .pop()
      ?.trim()
      .toLowerCase() ?? '';

  return fileExtenstions.includes(distributionExtension);
};

export const getSizeOfResourcesToDownload = (
  /* tslint:disable-next-line */
  resultsObject: Array<ResourceObscured | undefined>,
  types: string[]
) => {
  return sum(
    compact(
      flatMap(resultsObject).map(item => {
        // If no types are selected, show the size of only the top level resources (i.e. don't include size of distribution).
        if (types.length === 0) {
          return item?.localStorageType === 'resource' ? item.size : 0;
        }
        // If user has selected types, show size of only the distribution that match the selected types.
        return distributionMatchesTypes(item?.distribution, types)
          ? item?.size
          : 0;
      })
    )
  );
};
