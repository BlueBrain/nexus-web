import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import PromisePool from '@supercharge/promise-pool';
import { notification } from 'antd';
import { useQuery } from 'react-query';
import { makeOrgProjectTuple } from '../../shared/molecules/MyDataTable/MyDataTable';
import { isString } from 'lodash';

export const usePaginatedExpandedResources = ({
  pageSize,
  offset,
  orgAndProject,
  type,
  deprecated,
}: PaginatedResourcesParams) => {
  const nexus = useNexusContext();

  return useQuery({
    queryKey: [
      'data-explorer',
      { pageSize, offset, orgAndProject, type, deprecated },
    ],
    retry: false,
    queryFn: async () => {
      const resultWithPartialResources = await nexus.Resource.list(
        orgAndProject?.[0],
        orgAndProject?.[1],
        {
          type,
          deprecated,
          from: offset,
          size: pageSize,
        }
      );

      // If we failed to fetch the expanded source for some resources, we can use the compact/partial resource as a fallback.
      const fallbackResources: Resource[] = [];
      const { results: expandedResources } = await PromisePool.withConcurrency(
        4
      )
        .for(resultWithPartialResources._results)
        .handleError(async (err, partialResource) => {
          console.log(
            `@@error in fetching resource with id: ${partialResource['@id']}`,
            err
          );
          fallbackResources.push(partialResource);
          return;
        })
        .process(async partialResource => {
          if (partialResource._project) {
            const { org, project } = makeOrgProjectTuple(
              partialResource._project
            );

            return (await nexus.Resource.get(
              org,
              project,
              encodeURIComponent(partialResource['@id']),
              { annotate: true }
            )) as Resource;
          }

          return partialResource;
        });
      return {
        ...resultWithPartialResources,
        _results: [...expandedResources, ...fallbackResources],
      };
    },
    onError: error => {
      notification.error({
        message: 'Error loading data from the server',
        description: isString(error) ? (
          error
        ) : isObject(error) ? (
          <div>
            <strong>{(error as any)['@type']}</strong>
            <div>{(error as any)['details']}</div>
          </div>
        ) : (
          ''
        ),
      });
    },
    staleTime: Infinity,
  });
};

export const useAggregations = (
  bucketName: 'projects' | 'types',
  orgAndProject?: string[]
) => {
  const nexus = useNexusContext();
  return useQuery({
    queryKey: ['data-explorer-aggregations', orgAndProject],
    retry: false,
    queryFn: async () => {
      return await nexus.Resource.list(orgAndProject?.[0], orgAndProject?.[1], {
        aggregations: true,
      });
    },
    select: data => {
      return (
        ((data as unknown) as AggregationsResult).aggregations[bucketName]
          ?.buckets ?? ([] as AggregatedBucket[])
      );
    },
    onError: error => {
      notification.error({ message: 'Aggregations could not be fetched' });
    },
    staleTime: Infinity,
  });
};

export const sortColumns = (a: string, b: string) => {
  // Sorts paths alphabetically. Additionally all paths starting with an underscore are sorted at the end of the list (because they represent metadata).
  const columnA = columnFromPath(a);
  const columnB = columnFromPath(b);

  if (!isUserColumn(columnA) && !isUserColumn(columnB)) {
    return a.localeCompare(b);
  }
  if (!isUserColumn(columnA)) {
    return 1;
  }
  if (!isUserColumn(columnB)) {
    return -1;
  }
  // Neither a, nor b are userColumns. Now, we want to "ALWAYS_SORTED_COLUMNS" to appear below other user defined columns like "contributions"
  if (ALWAYS_DISPLAYED_COLUMNS.has(a) && ALWAYS_DISPLAYED_COLUMNS.has(b)) {
    return a.localeCompare(b);
  }
  if (ALWAYS_DISPLAYED_COLUMNS.has(a)) {
    return 1;
  }
  if (ALWAYS_DISPLAYED_COLUMNS.has(b)) {
    return -1;
  }
  return a.localeCompare(b);
};

export const columnFromPath = (path: string | null) =>
  path?.split('.')[0] ?? '';

export const isUserColumn = (colName: string) => {
  return ALWAYS_DISPLAYED_COLUMNS.has(colName) || !isNexusMetadata(colName);
};

export const ALWAYS_DISPLAYED_COLUMNS = new Set([
  '_project',
  '_createdAt',
  '_updatedAt',
]);

const UNDERSCORE = '_';

const METADATA_COLUMNS = new Set(['@id', '@context']);

export const isNexusMetadata = (colName: string) =>
  METADATA_COLUMNS.has(colName) || colName.startsWith(UNDERSCORE);

export const isObject = (value: any) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export interface AggregationsResult {
  '@context': string;
  total: number;
  aggregations: {
    projects: AggregatedProperty;
    types: AggregatedProperty;
  };
}

export type AggregatedProperty = {
  buckets: AggregatedBucket[];
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
};

export type AggregatedBucket = { key: string; doc_count: number };

interface PaginatedResourcesParams {
  pageSize: number;
  offset: number;
  orgAndProject?: string[];
  type?: string;
  deprecated: boolean;
}
