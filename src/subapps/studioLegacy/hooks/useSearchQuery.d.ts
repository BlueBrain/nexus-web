import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { AsyncCall } from '../../../shared/hooks/useAsynCall';
import { SearchResponse } from '../../../shared/types/search';
export declare const TOTAL_HITS_TRACKING = 1000000;
export declare type UseSearchResponse = AsyncCall<SearchResponse<Resource>>;
export declare enum SortDirection {
  DESCENDING = 'desc',
  ASCENDING = 'asc',
}
export declare type UseSearchProps = {
  query?: object;
  sort?:
    | {
        key: string;
        direction: SortDirection;
      }
    | {
        key: string;
        direction: SortDirection;
      }[];
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
export default function useSearchQueryFromStudio(
  selfURL: string | null,
  query: object | undefined,
  paginationFrom: number,
  paginationSize: number
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
  }
];
