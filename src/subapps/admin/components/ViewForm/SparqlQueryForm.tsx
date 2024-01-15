import { FC, useState } from 'react';
import { Button } from 'antd';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/es';

import SparqlQueryResults, { NexusSparqlError } from './SparqlQueryResults';
import SparqlQueryInput from './SparqlQueryInput';

import './view-form.scss';

const SparqlQueryForm: FC<{
  query: string;
  response?: SparqlViewQueryResponse | null;
  busy: boolean;
  error: NexusSparqlError | null;
  resultsComponent?(props: {
    response?: SparqlViewQueryResponse | null;
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
  return (
    <div className="view-form">
      <SparqlQueryInput value={query} onChange={onQueryChange} />
      {resultsComponent({ error, busy, response })}
    </div>
  );
};

export default SparqlQueryForm;
