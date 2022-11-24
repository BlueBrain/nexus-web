import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { AsyncCall } from './useAsynCall';
import { SearchResponse } from '../types/search';
import { FacetConfig } from '../store/reducers/search';
export declare const TOTAL_HITS_TRACKING = 1000000;
export declare type UseSearchResponse = AsyncCall<SearchResponse<Resource>>;
export declare type SerializedFacetMap = {
  [propertyKey: string]: string[];
};
export declare const serializeSearchFacets: (
  facetMap: UseSearchProps['facetMap']
) => SerializedFacetMap;
export declare const parseSerializedSearchFacets: (
  facetMap: UseSearchProps['facetMap'],
  serializedSearchFacets: SerializedFacetMap
) =>
  | Map<
      string,
      FacetConfig & {
        value: Set<string>;
      }
    >
  | undefined;
export declare enum SortDirection {
  DESCENDING = 'desc',
  ASCENDING = 'asc',
}
export declare type UseSearchProps = {
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
  facetMap?: Map<
    string,
    FacetConfig & {
      value: Set<string>;
    }
  >;
};
export declare const DEFAULT_SEARCH_PROPS: {
  pagination: {
    from: number;
    size: number;
  };
  sort: {
    key: string;
    direction: SortDirection;
  };
};
export interface UseSearchQueryProps {
  selfURL?: string | null;
}
export default function useSearchQuery(
  props: UseSearchQueryProps
): [
  AsyncCall<
    SearchResponse<
      Resource<{
        [key: string]: any;
      }>
    >,
    Error
  >,
  {
    searchProps: UseSearchProps;
    setSearchProps: React.Dispatch<React.SetStateAction<UseSearchProps>>;
    query: object;
  }
];
