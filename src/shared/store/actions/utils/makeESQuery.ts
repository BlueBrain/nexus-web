import { ResourceBoardList } from '../../../containers/ResourceListBoardContainer';

const managementSchemas = [
  'https://bluebrain.github.io/nexus/schemas/resolver.json',
  'https://bluebrain.github.io/nexus/schemas/storage.json',
  'https://bluebrain.github.io/nexus/schemas/view.json',
];

interface TermFilter {
  term: { [termKey: string]: string };
}

// TODO break out into library
export const makeESQuery = (query?: ResourceBoardList['query']) => {
  const sort = [
    {
      _createdAt: 'desc',
    },
    {
      '@id': 'desc',
    },
  ];

  if (query) {
    const must = [];
    const mustNot: any[] = []; // too lazy to type all of the possible query types!
    if (Object.keys(query.filters).length) {
      Object.keys(query.filters).forEach(key => {
        // exception to make filtering easier
        // because management resources are many
        if (key === 'showManagementResources') {
          const should: TermFilter[] = []; // OR === Should
          managementSchemas.forEach(schema => {
            should.push({
              term: { _constrainedBy: schema },
            });
          });
          if (!!query.filters[key]) {
            // showManagementResoruces is true, add them as
            // a must match to the filter
            must.push({
              bool: {
                should,
              },
            });
          } else {
            // otherwise add as mustNot match to filter them out
            mustNot.push({
              bool: {
                should,
              },
            });
          }
          // Otherwise we ignore this value, as it's
          // not a real filterable value
          // just a convenience label
          return;
        }
        // any other keys inside the filter object
        // are legitimate filterable keys
        must.push({
          term: { [key]: query.filters[key] },
        });
      });
    }
    if (query.textQuery) {
      must.push({
        // from example: https://github.com/BlueBrain/nexus-kg/blob/master/src/test/resources/search/query-schema-rev-createdBy-q.json#L10-L12
        match: {
          _all_fields: query.textQuery,
        },
      });
    }

    if (must.length >= 1 || mustNot.length >= 1) {
      return {
        sort,
        query: {
          bool: {
            must,
            must_not: mustNot,
          },
        },
      };
    }
    if (must.length === 0) {
      return {
        sort,
      };
    }
    return {
      sort,
      query: {
        ...must[0],
      },
    };
  }
  return {};
};
