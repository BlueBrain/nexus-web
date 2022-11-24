import { ESSortField } from '../hooks/useGlobalSearch';
export declare const constructQuery: (searchText: string) => any;
export declare const constructFilterSet: (
  body: any,
  filterSet: {
    filters: string[];
    filterType: string;
    filterTerm: string;
  }[]
) => any;
export declare const constructNumberFilter: (
  body: any,
  filters: string[],
  filterType: string,
  filterTerm: string
) => any;
export declare const constructDateFilter: (
  body: any,
  filters: string[],
  filterType: string,
  filterTerm: string
) => any;
export declare const constructFilter: (
  body: any,
  filters: string[],
  filterType: string,
  filterTerm: string
) => any;
export declare const addSorting: (body: any, sort: ESSortField[]) => any;
export declare const addPagination: (
  body: any,
  page: number,
  pageSize: number
) => any;
export declare const constructAggregations: (
  body: any,
  field: string,
  aggregateType: string
) => void;
