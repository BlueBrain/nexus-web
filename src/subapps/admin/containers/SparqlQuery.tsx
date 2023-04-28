import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import {
  DEFAULT_SPARQL_VIEW_ID,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';

import SparqlQueryForm from '../components/ViewForm/SparqlQueryForm';

const DEFAULT_QUERY = `# Directly edit this query
SELECT ?s ?p ?o
WHERE {?s ?p ?o}
LIMIT 20
`;

const SparqlQueryContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  initialQuery?: string | null;
  viewId?: string;
}> = ({
  orgLabel,
  projectLabel,
  initialQuery,
  viewId = DEFAULT_SPARQL_VIEW_ID,
}) => {
  const nexus = useNexusContext();
  const [query, setQuery] = React.useState<string>(
    initialQuery || DEFAULT_QUERY
  );
  const [{ response, busy, error }, setResponse] = React.useState<{
    response: SparqlViewQueryResponse | null;
    busy: boolean;
    error: string | null;
  }>({
    response: null,
    busy: false,
    error: null,
  });

  React.useEffect(() => {
    setResponse({
      response: null,
      busy: true,
      error: null,
    });
    nexus.View.sparqlQuery(orgLabel, projectLabel, viewId, query)
      .then(response => {
        setResponse({
          response,
          busy: false,
          error: null,
        });
      })
      .catch(error => {
        setResponse({
          error,
          response: null,
          busy: false,
        });
      });
  }, [orgLabel, projectLabel, viewId, query]);

  const onQueryChange = (query: string) => {
    setQuery(query);
  };

  return (
    <SparqlQueryForm
      query={query}
      response={response}
      busy={busy}
      error={error}
      onQueryChange={onQueryChange}
    />
  );
};

export default SparqlQueryContainer;
