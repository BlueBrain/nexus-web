import * as bodybuilder from 'bodybuilder';
import { ESSortField } from '../hooks/useGlobalSearch';
import { ESMaxResultWindowSize } from '../hooks/useSearchPagination';

export const constructQuery = (searchText: string) => {
  const body = bodybuilder();
  searchText
    ? body.query('multi_match', {
        query: searchText,
        fuzziness: 5,
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
    if (filter.filters.length > 0) {
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

export const constructFilter = (
  body: bodybuilder.Bodybuilder,
  filters: string[],
  filterType: string,
  filterTerm: string
) => {
  filters.forEach((item: string) => {
    if (filterType === 'anyof') {
      body.orFilter('prefix', filterTerm, item);
    } else if (filterType === 'noneof') {
      body.notFilter('prefix', filterTerm, item);
    } else if (filterType === 'allof') {
      body.addFilter('prefix', filterTerm, item);
    } else if (filterType === 'missing') {
      body.notQuery('exists', filterTerm);
    }
  });
  return body;
};

export const addSorting = (
  body: bodybuilder.Bodybuilder,
  sort: ESSortField[]
) => {
  sort.forEach(s => body.sort(s.term, s.direction));
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
