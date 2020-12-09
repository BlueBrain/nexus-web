import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import * as bodybuilder from 'bodybuilder';
import { Resource } from '@bbp/nexus-sdk';

import useAsyncCall, { AsyncCall } from './useAsynCall';
import { parseURL } from '../utils/nexusParse';
import { SearchResponse } from '../types/search';

// TODO move to global default list
const DEFAULT_PAGE_SIZE = 20;

export type SerializedFacetMap = {
  [propertyKey: string]: string[];
};

export const serializeSearchFacets = (
  facetMap: UseSearchProps['facetMap']
): SerializedFacetMap => {
  return Array.from(facetMap || []).reduce((memo, [key, value]) => {
    memo[value.propertyKey] = [...value.value.values()];
    return memo;
  }, {} as { [propertyKey: string]: any });
};

export const parseSerializedSearchFacets = (
  facetMap: UseSearchProps['facetMap'],
  serializedSearchFacets: SerializedFacetMap
) => {
  facetMap?.forEach(value => {
    const serializedValue = serializedSearchFacets[value.propertyKey];
    if (serializedValue) {
      value.value.clear();
      serializedValue.forEach(key => {
        value.value.add(key);
      });
    }
  });
  return facetMap;
};

export enum SortDirection {
  DESCENDING = 'desc',
  ASCENDING = 'asc',
}

export type UseSearchProps = {
  query?: string;
  sort?: {
    key: string;
    direction: SortDirection;
  };
  pagination?: {
    from: number;
    size: number;
  };
  facetMap?: Map<
    string,
    {
      propertyKey: string;
      label: string;
      type: 'terms';
      value: Set<string>;
    }
  >;
};

export const DEFAULT_SEARCH_PROPS = {
  pagination: { from: 0, size: DEFAULT_PAGE_SIZE },
  sort: {
    key: '_createdAt',
    direction: SortDirection.DESCENDING,
  },
};

export default function useSearchQuery(selfURL?: string | null) {
  const [searchProps, setSearchProps] = React.useState<UseSearchProps>({
    ...DEFAULT_SEARCH_PROPS,
  });
  const {
    query,
    sort = DEFAULT_SEARCH_PROPS.sort,
    pagination = DEFAULT_SEARCH_PROPS.pagination,
    facetMap = new Map<
      string,
      {
        propertyKey: string;
        label: string;
        type: 'terms';
        value: Set<string>;
      }
    >(),
  } = searchProps;

  const nexus = useNexusContext();

  const searchNexus = async () => {
    if (!selfURL) {
      return null;
    }

    // TODO fix query to match @id's as well
    const matchQuery = query
      ? ['wildcard', '_original_source', `${query}*`]
      : ['match_all', {}];

    const body = bodybuilder();

    body
      // TODO upgrade typescript to enable spread arguments
      // @ts-ignore
      .filter(...matchQuery)
      .filter('term', '_deprecated', false)
      .sort(sort.key, sort.direction);

    facetMap.forEach(({ propertyKey, type, label, value }) => {
      value.forEach(item => {
        body.filter('term', propertyKey, item);
      });
      body.aggregation(type, propertyKey, label);
    });

    body.size(pagination.size).from(pagination.from);

    const finalQuery = body.build();
    const { org, project, id } = parseURL(selfURL);

    return await nexus.View.elasticSearchQuery<SearchResponse<Resource>>(
      org,
      project,
      encodeURIComponent(id),
      finalQuery
    );
  };

  const remoteResponse = useAsyncCall<SearchResponse<Resource> | null, Error>(
    searchNexus(),
    [searchProps, selfURL],
    true
  );

  return [remoteResponse, { searchProps, setSearchProps }] as [
    AsyncCall<SearchResponse<Resource>>,
    {
      searchProps: UseSearchProps;
      setSearchProps: React.Dispatch<React.SetStateAction<UseSearchProps>>;
    }
  ];
}
