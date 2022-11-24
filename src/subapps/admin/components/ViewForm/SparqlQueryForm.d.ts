import * as React from 'react';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk';
import { NexusSparqlError } from './SparqlQueryResults';
import './view-form.less';
declare const SparqlQueryForm: React.FunctionComponent<{
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
}>;
export default SparqlQueryForm;
