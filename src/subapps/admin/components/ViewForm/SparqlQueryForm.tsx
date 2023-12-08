import './view-form.scss';

import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/es';
import { Button } from 'antd';
import * as React from 'react';

import SparqlQueryInput from './SparqlQueryInput';
import SparqlQueryResults, { NexusSparqlError } from './SparqlQueryResults';

const SparqlQueryForm: React.FunctionComponent<{
  query: string;
  response: SparqlViewQueryResponse | null;
  busy: boolean;
  error: NexusSparqlError | null;
  resultsComponent?(props: {
    response: SparqlViewQueryResponse | null;
    busy: boolean;
    error: NexusSparqlError | null;
  }): React.ReactElement;
  onQueryChange: (query: string) => void;
}> = ({
  query,
  response,
  busy,
  error,
  onQueryChange,
  resultsComponent = SparqlQueryResults,
}): JSX.Element => {
  const [input, setInput] = React.useState<string>(query);
  return (
    <div className="view-form">
      <SparqlQueryInput
        value={input}
        onChange={(text) => {
          setInput(text);
        }}
      />
      <Button
        type="primary"
        onClick={() => {
          onQueryChange(input);
        }}
      >
        Execute SPARQL query
      </Button>
      {resultsComponent({ error, busy, response })}
    </div>
  );
};

export default SparqlQueryForm;
