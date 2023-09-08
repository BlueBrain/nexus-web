import { useEffect } from 'react';
import { PaginatedList, Resource } from '@bbp/nexus-sdk';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { isString } from 'lodash';
import PromisePool from '@supercharge/promise-pool';
import { makeOrgProjectTuple } from '../../shared/molecules/MyDataTable/MyDataTable';
import { TTypeOperator } from '../../shared/molecules/TypeSelector/types';
import * as bodybuilder from 'bodybuilder';
import { useSelector } from 'react-redux';
import { RootState } from 'shared/store/reducers';
import { SearchResponse } from 'shared/types/search';

export const usePaginatedExpandedResources = ({
  pageSize,
  offset,
  orgAndProject,
  deprecated,
  types,
  typeOperator,
  predicateQuery,
}: PaginatedResourcesParams) => {
  const nexus = useNexusContext();
  const { apiEndpoint } = useSelector((state: RootState) => state.config);
  return useQuery({
    queryKey: [
      'data-explorer',
      {
        pageSize,
        offset,
        orgAndProject,
        predicateQuery,
        ...(types?.length
          ? {
              types,
              typeOperator,
            }
          : {}),
      },
    ],
    retry: false,
    queryFn: async () => {
      if (predicateQuery && orgAndProject) {
        return getResultsForPredicateQuery(
          nexus,
          apiEndpoint,
          orgAndProject[0],
          orgAndProject[1],
          predicateQuery,
          pageSize,
          offset
        );
      }

      const resultWithPartialResources = await nexus.Resource.list(
        orgAndProject?.[0],
        orgAndProject?.[1],
        {
          deprecated,
          // @ts-ignore
          typeOperator,
          // @ts-ignore
          type: types,
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

export type GraphAnalyticsProperty = {
  '@id'?: string; // TODO Make necessory
  _name: string;
  _count?: number;
  _properties: GraphAnalyticsProperty[];
};

type GraphAnalyticsResponse = {
  _properties: GraphAnalyticsProperty[];
};

export const useGraphAnalyticsPath = (
  org: string,
  project: string,
  types: string[]
) => {
  const nexus = useNexusContext();
  return useQuery({
    queryKey: ['graph-analytics-paths', org, project, types],
    retry: false,
    staleTime: Infinity,
    queryFn: async () => {
      return (await nexus.GraphAnalytics.properties(
        project,
        org,
        types[0]
      )) as GraphAnalyticsResponse;
    },
    select: data => {
      return getPathsForProperties(data._properties);
    },
  });
};

const getResultsForPredicateQuery = async (
  nexus: ReturnType<typeof useNexusContext>,
  apiEndpoint: string,
  org: string,
  project: string,
  query: Object,
  pageSize: number,
  offset: number
) => {
  const searchResults: SearchResponse<{ '@id': string }> = await nexus.httpPost(
    {
      path: `${apiEndpoint}/graph-analytics/${org}/${project}/_search`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: offset,
        size: pageSize,
        ...query,
      }),
    }
  );

  const { results: matchingResources } = await PromisePool.withConcurrency(4)
    .for(searchResults.hits.hits)
    .handleError((err, item) => {
      console.error(
        `There was an error retrieving matching resource ${item._source['@id']} for query.`,
        query,
        err
      );
    })
    .process(async matchingHit => {
      return (await nexus.Resource.get(
        org,
        project,
        encodeURIComponent(matchingHit._source['@id']),
        { annotate: true }
      )) as Resource;
    });

  return {
    _results: matchingResources,
    _total: searchResults.hits.total.value,
  } as PaginatedList<Resource>;
};

export const getUniquePathsForProperties = (
  properties: GraphAnalyticsProperty[],
  paths: string[] = [],
  pathSoFar?: string
): string[] => {
  properties?.forEach(property => {
    const name = pathSoFar ? `${pathSoFar}.${property._name}` : property._name;
    paths.push(name);
    getUniquePathsForProperties(property._properties ?? [], paths, name);
  });

  return Array.from(new Set(paths));
};

export type PropertyPath = {
  label: string;
  value: string;
};

export const getPathsForProperties = (
  properties: GraphAnalyticsProperty[],
  paths: PropertyPath[] = [],
  pathSoFar?: string,
  valueSoFar?: string
): PropertyPath[] => {
  properties?.forEach(property => {
    const label = pathSoFar ? `${pathSoFar}.${property._name}` : property._name;
    const value = valueSoFar
      ? `${valueSoFar} / ${property['@id']!}`
      : property['@id']!;
    paths.push({ label, value });
    getPathsForProperties(property._properties ?? [], paths, label, value);
  });

  const uniquePaths = new Set(paths.map(path => path.value));
  return paths.filter(path => uniquePaths.has(path.value));
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
  deprecated: boolean;
  types?: string[];
  typeOperator: TTypeOperator;
  predicateQuery: Object | null;
}

export const useTimeoutMessage = ({
  show,
  timeout,
  cb,
}: {
  timeout: number;
  cb: Function;
  show: boolean;
}) => {
  useEffect(() => {
    let timeoutId: number;
    if (show) {
      timeoutId = window.setTimeout(() => {
        cb();
        clearTimeout(timeoutId);
      }, timeout);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [show]);
};
