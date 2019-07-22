export const makeDatasetQuery = (
  datasetQueryConfig: {
    vocab: string;
    graphs: { [filterName: string]: string };
  },
  appliedFacets: { [filterName: string]: string[] },
  size: number,
  from: number
) => {
  // graphQueries look like this
  // {
  //   brainRegion: `
  // Graph ?g {
  //   VALUES ?search { #{values} }
  //   ?s1 nxs:brainRegion ?search .
  // }
  //   `
  // }

  const graphQueries = Object.keys(datasetQueryConfig.graphs)
    .map(key => {
      // unparsed query looks like this
      // Graph ?g {
      //   VALUES ?search { #{values} }
      //   ?s1 nxs:brainRegion ?search .
      // }
      const unparsedQuery = datasetQueryConfig.graphs[key];

      console.log({ unparsedQuery });

      // we dont need to parse this for now...
      // mainly because I don't know how to handle these query caes
      // where you always want it to be used
      if (key === 'constrainedBy') {
        return unparsedQuery;
      }

      // lets get the list of ids for this applied facet key
      // in our example, the key would be brainRegion
      // and the ids would be something like http://api.brain-map.org/api/v2/data/Structure/778
      const ids = appliedFacets[key];

      if (ids && ids.length) {
        // for the sparql query to work we need to always wrap URIs in <>
        const values = (ids || []).map(id => `<${id}>`).join(' ');

        // now we need to add the appliedFacet values, if available
        const parseQuery = unparsedQuery.replace('#{values}', values);
        return parseQuery;
      }
      return null;
    })
    .filter(queryString => !!queryString)
    .join('');

  return `
  ${datasetQueryConfig.vocab}

  SELECT ?total ?s
     WITH {
      SELECT DISTINCT ?s {
        ${graphQueries}
      }
     } AS %resultSet

   WHERE {
        {
           SELECT (COUNT(?s) AS ?total)
           WHERE { INCLUDE %resultSet }
        }
        UNION
       {
           SELECT *
           WHERE { INCLUDE %resultSet }
           ORDER BY ?s
           LIMIT ${size}
           OFFSET ${from}
        }
     }
   `;
};
