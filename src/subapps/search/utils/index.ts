import * as bodybuilder from 'bodybuilder';
import { ESSortField } from '../hooks/useGlobalSearch';
import { ESMaxResultWindowSize } from '../hooks/useSearchPagination';

export const constructQuery = (searchText: string) => {
  const body = bodybuilder();
  searchText
    ? body.query('multi_match', {
        query: searchText,
        prefix_length: 0,
        fields: ['*'],
      })
    : body.query('match_all', {});
  return body;
};

export const constructFilterSet = (
  body: bodybuilder.Bodybuilder,
  filterSet: {
    filters: string[];
    filterType: string;
    filterTerm: string;
  }[]
) => {
  filterSet.forEach(filter => {
    if (filter.filterType === 'date') {
      constructDateFilter(
        body,
        filter.filters,
        filter.filterType,
        filter.filterTerm
      );
    } else if (filter.filterType === 'number') {
      constructNumberFilter(
        body,
        filter.filters,
        filter.filterType,
        filter.filterTerm
      );
    } else if (filter.filters.length > 0 || filter.filterType === 'missing') {
      constructFilter(
        body,
        filter.filters,
        filter.filterType,
        filter.filterTerm
      );
    }
  });
  return body;
};

const missingFilterValueAdder = (filterTerm: string) => {
  return (missing: bodybuilder.FilterSubFilterBuilder) =>
    missing.notFilter('exists', filterTerm);
};

export const constructNumberFilter = (
  body: bodybuilder.Bodybuilder,
  filters: string[],
  filterType: string,
  filterTerm: string
) => {
  if (filters[0] === 'isMissing') {
    body.andFilter('bool', missingFilterValueAdder(filterTerm));
    return body;
  }
  const filterObject: any = {};
  if (filters[0] !== undefined && filters[0] !== null && filters[0] !== '') {
    filterObject['gte'] = parseFloat(filters[0]);
  }
  if (filters.length > 1 && filters[1] !== '') {
    filterObject['lte'] = parseFloat(filters[1]);
  }
  body.addFilter('range', `${filterTerm}.value`, filterObject);
  return body;
};

export const constructDateFilter = (
  body: bodybuilder.Bodybuilder,
  filters: string[],
  filterType: string,
  filterTerm: string
) => {
  const filterObject: any = {};
  if (filters[0] !== undefined && filters[0] !== null && filters[0] !== '') {
    filterObject['gte'] = filters[0];
  }
  if (filters.length > 1 && filters[1] !== '') {
    filterObject['lte'] = filters[1];
  }
  body.addFilter('range', filterTerm, filterObject);
  return body;
};

export const constructFilter = (
  body: bodybuilder.Bodybuilder,
  filters: string[],
  filterType: string,
  filterTerm: string
) => {
  body.andFilter('bool', b => {
    if (filterType === 'missing') {
      b.notFilter('exists', filterTerm);
      return b;
    }
    filters.forEach((item: string) => {
      if (filterType === 'anyof') {
        if (item !== '(Missing)') {
          b.orFilter('term', filterTerm, item);
        } else {
          b.orFilter('bool', missingFilterValueAdder(filterTerm));
        }
      } else if (filterType === 'noneof') {
        if (item !== '(Missing)') {
          b.notFilter('term', filterTerm, item);
        } else {
          b.notFilter('bool', missingFilterValueAdder(filterTerm));
        }
      } else if (filterType === 'allof') {
        if (item !== '(Missing)') {
          b.addFilter('term', filterTerm, item);
        } else {
          b.addFilter('bool', missingFilterValueAdder(filterTerm));
        }
      }
    });
    return b;
  });

  return body;
};

export const addSorting = (
  body: bodybuilder.Bodybuilder,
  sort: ESSortField[]
) => {
  sort.forEach(s => {
    if (s.format?.includes('date')) {
      return body.sort(s.fieldName, s.direction);
    }
    return body.sort(s.term, s.direction);
  });
  return body;
};

export const addPagination = (
  body: bodybuilder.Bodybuilder,
  page: number,
  pageSize: number
) => {
  /* Make sure we don't exceed the ElasticSearch paging limit */
  const from = (page - 1) * pageSize;
  const pageSizeRespectingLimit =
    from + pageSize > ESMaxResultWindowSize
      ? ESMaxResultWindowSize - from
      : pageSize;

  body
    .rawOption('track_total_hits', true) // accurate total, could cache for performance
    .size(pageSizeRespectingLimit)
    .from((page - 1) * pageSize);
  return body;
};

export const constructAggregations = (
  body: bodybuilder.Bodybuilder,
  field: string,
  aggregateType: string
) => {
  body.aggregation(aggregateType, field);
};
