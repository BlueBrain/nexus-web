import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import bodybuilder from 'bodybuilder';
import { Resource } from '@bbp/nexus-sdk';

import useAsyncCall, { AsyncCall } from './useAsynCall';
import { parseURL } from '../utils/nexusParse';
import { SearchResponse } from '../types/search';
import { FacetConfig, FacetType } from '../store/reducers/search';

// TODO move to global default list
const DEFAULT_PAGE_SIZE = 20;

export const TOTAL_HITS_TRACKING = 1000000;

export type UseSearchResponse = AsyncCall<SearchResponse<Resource>>;

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
  sort?:
    | {
        key: string;
        direction: SortDirection;
      }
    | {
        key: string;
        direction: SortDirection;
      }[];
  pagination?: {
    from: number;
    size: number;
  };
  facetMap?: Map<string, FacetConfig & { value: Set<string> }>;
};

export const DEFAULT_SEARCH_PROPS = {
  pagination: { from: 0, size: DEFAULT_PAGE_SIZE },
  sort: {
    key: '_createdAt',
    direction: SortDirection.DESCENDING,
  },
};

export interface UseSearchQueryProps {
  selfURL?: string | null;
}

export default function useSearchQuery(props: UseSearchQueryProps) {
  const { selfURL } = props;
  const [searchProps, setSearchProps] = React.useState<UseSearchProps>({
    ...DEFAULT_SEARCH_PROPS,
  });
  const {
    query,
    sort,
    pagination = DEFAULT_SEARCH_PROPS.pagination,
    facetMap,
  } = searchProps;

  const nexus = useNexusContext();

  const makeBodyQuery = () => {
    // TODO fix query to match @id's as well
    // might need backend support
    // TODO allow configurable query target
    // not all ES View mappings will have this property.
    const matchQuery = query
      ? ['wildcard', '_original_source', `${query}*`]
      : ['match_all', {}];

    const body = bodybuilder();

    body
      // TODO upgrade typescript to enable spread arguments
      // @ts-ignore
      .filter(...matchQuery)
      .filter('term', '_deprecated', false);

    // Sorting
    if (Array.isArray(sort)) {
      sort.forEach(sort => {
        body.sort(sort.key, sort.direction);
      });
    } else {
      sort && body.sort(sort.key, sort.direction);
    }

    if (facetMap) {
      facetMap.forEach(({ propertyKey, key, type, value }) => {
        if (type === FacetType.TERMS) {
          value.forEach(item => {
            body.filter('term', propertyKey, item);
          });
          body.aggregation(
            type,
            propertyKey,
            { size: TOTAL_HITS_TRACKING },
            key
          );
        }
      });
    }

    body
      .size(pagination.size)
      .from(pagination.from)
      .rawOption('track_total_hits', TOTAL_HITS_TRACKING);

    return body.build();
  };

  const body = makeBodyQuery();

  const searchNexus = async () => {
    if (!selfURL) {
      return null;
    }

    const { org, project, id } = parseURL(selfURL);

    const encodedID = encodeURIComponent(id);
    const usefulId = encodedID === id ? id : encodedID;

    return await nexus.View.elasticSearchQuery<SearchResponse<Resource>>(
      org,
      project,
      usefulId,
      body
    );
  };

  const remoteResponse = useAsyncCall<SearchResponse<Resource> | null, Error>(
    searchNexus(),
    [searchProps, selfURL],
    true
  );

  return [remoteResponse, { searchProps, setSearchProps, query: body }] as [
    UseSearchResponse,
    {
      searchProps: UseSearchProps;
      setSearchProps: React.Dispatch<React.SetStateAction<UseSearchProps>>;
      query: object;
    }
  ];
}
