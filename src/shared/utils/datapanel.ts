import { Resource } from '@bbp/nexus-sdk';
import * as Sentry from '@sentry/browser';
import { compact, flatMap, isArray, isNil, sum } from 'lodash';
import { TDataSource } from '../../shared/molecules/MyDataTable/MyDataTable';
import { fileExtensionFromResourceEncoding } from '../../utils/contentTypes';
import isValidUrl from '../../utils/validUrl';
import { ResourceObscured } from 'shared/organisms/DataPanel/DataPanel';
import { getResourceLabel, uuidv4 } from '.';
import { parseURL } from './nexusParse';

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
  const resourceName = getResourceLabel(resource);
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
        ...baseLocalStorageObject(resource, source, '1'),
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

export type FilePath = { path: string; filename: string; extension: string };

export function pathForTopLevelResources(
  resource: ResourceObscured,
  existingPaths: Map<string, number>
): FilePath {
  const self = isArray(resource._self) ? resource._self[0] : resource._self;
  const parsedSelf = parseURL(self);
  const encodedName = encodeURIComponent(resource.name);

  const fullPath = `/${parsedSelf.org}/${parsedSelf.project}/${encodedName}`;

  let uniquePath: string;
  if (existingPaths.has(fullPath)) {
    const count = existingPaths.get(fullPath)!;
    uniquePath = `${fullPath}-${count}`;
    existingPaths.set(fullPath, count + 1);
  } else {
    uniquePath = fullPath;
    existingPaths.set(fullPath, 1);
  }

  return {
    path: uniquePath, // Max Length - 60
    filename: resource['@type'] === 'File' ? encodedName : 'metadata', // Max Length - 20
    extension:
      resource['@type'] === 'File' && resource.contentType
        ? resource.contentType
        : 'json', // Max Length - 4
  };
}

export function pathForChildDistributions(
  distItem: any,
  parentPath: string,
  existingPaths: Map<string, number>
) {
  const defaultUniqueName = uuidv4().substring(0, 10); // TODO use last part of child self or id

  const fullFileName = fileNameForDistributionItem(distItem, defaultUniqueName);
  const fileNameWithoutExtension = fullFileName.slice(
    0,
    fullFileName.lastIndexOf('.')
  );
  const extension = fullFileName.slice(fullFileName.lastIndexOf('.') + 1);

  const childDir = fileNameWithoutExtension; // Max Length 20
  const pathToChildFile = `${parentPath}/${childDir}`; // Max Length 60 + 1 + 20 = 80
  let uniquePath: string; // TODO de-deuplicate
  if (existingPaths.has(pathToChildFile)) {
    const count = existingPaths.get(pathToChildFile)!;
    uniquePath = `${pathToChildFile}-${count}`;
    existingPaths.set(pathToChildFile, count + 1);
  } else {
    uniquePath = pathToChildFile;
    existingPaths.set(pathToChildFile, 1);
  }

  return {
    path: uniquePath,
    fileName: `${fileNameWithoutExtension}.${extension}`,
  };
}
