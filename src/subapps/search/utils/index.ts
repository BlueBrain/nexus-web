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

export const constructFilter = (
  body: bodybuilder.Bodybuilder,
  filters: string[],
  filterType: string,
  filterTerm: string
) => {
  filters.forEach((item: string) => {
    if (filterType === 'anyof') {
      body.orFilter('prefix', item, filterTerm);
    } else if (filterType === 'noneof') {
      body.notFilter('prefix', item, filterTerm);
    } else if (filterType === 'allof') {
      body.addFilter('prefix', item, filterTerm);
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
