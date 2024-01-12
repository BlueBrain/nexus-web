import { useState } from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Button } from 'antd';
import { useMutation } from 'react-query';
import {
  DEFAULT_SPARQL_VIEW_ID,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk/es';

import SparqlQueryForm from '../components/ViewForm/SparqlQueryForm';
import { NexusSparqlError } from '../components/ViewForm/SparqlQueryResults';
import './SettingsContainer.scss';

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
  const [query, setQuery] = useState<string>(initialQuery || DEFAULT_QUERY);
  const { mutate, isLoading, data, error } = useMutation<
    SparqlViewQueryResponse,
    NexusSparqlError
  >(() => nexus.View.sparqlQuery(orgLabel, projectLabel, viewId, query), {});

  const runSparqlQuery = () => mutate();

  return (
    <>
      <div className="query-control-panel">
        <Button
          type="primary"
          onClick={runSparqlQuery}
          loading={isLoading}
          className="execute-sparql-query-btn"
        >
          Execute SPARQL query
        </Button>
      </div>
      <SparqlQueryForm
        query={query}
        response={data}
        busy={isLoading}
        error={error}
        onQueryChange={setQuery}
      />
    </>
  );
};

export default SparqlQueryContainer;
