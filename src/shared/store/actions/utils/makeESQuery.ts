import { List } from '../../reducers/lists';

// TODO break out into library
export const makeESQuery = (query?: List['query']) => {
  if (query) {
    const must = [];
    if (Object.keys(query.filters).length) {
      Object.keys(query.filters)
        .filter(key => !!query.filters[key])
        .forEach(key => {
          must.push({
            term: { [key]: query.filters[key] },
          });
        });
    }
    if (query.textQuery) {
      must.push({
        query_string: {
          query: `${query.textQuery}~`,
        },
      });
    }
    if (must.length > 1) {
      return {
        query: {
          bool: {
            must,
          },
        },
      };
    }
    if (must.length === 0) {
      return {};
    }
    return {
      query: {
        ...must[0],
      },
    };
  }
  return {};
};
