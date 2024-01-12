import { FC, useState } from 'react';
import { Button } from 'antd';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/es';

import SparqlQueryResults, { NexusSparqlError } from './SparqlQueryResults';
import SparqlQueryInput from './SparqlQueryInput';

import './view-form.scss';

const SparqlQueryForm: FC<{
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
  const [input, setInput] = useState<string>(query);
  const onChange = (text: string) => setInput(text);

  return (
    <div className="view-form">
      <SparqlQueryInput value={input} onChange={onChange} />
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
