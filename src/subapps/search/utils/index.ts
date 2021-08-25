import * as bodybuilder from 'bodybuilder';

export const constructQuery = (searchText: string) => {
  const body = bodybuilder();
  body.query('multi_match', {
    query: searchText,
    fuzziness: 5,
    prefix_length: 0,
    fields: ['*'],
  });
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
    }
  });
  return body;
};

export const addPagination = (
  body: bodybuilder.Bodybuilder,
  from: number,
  size: number
) => {
  body
    .rawOption('track_total_hits', true) // accurate total, could cache for performance
    .size(size)
    .from(from);
  return body;
};

export const constructAggregations = (
  body: bodybuilder.Bodybuilder,
  field: string,
  aggregateType: string
) => {
  body.aggregation(aggregateType, field);
};
