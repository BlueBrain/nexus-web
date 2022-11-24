import * as React from 'react';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk';
import './view-form.less';
export declare type NexusSparqlError =
  | string
  | {
      reason: string;
    };
export declare type Entry = {
  [key: string]: string;
  datatype: string;
  value: string;
  type: string;
};
declare const SparqlQueryResults: React.FunctionComponent<{
  response: SparqlViewQueryResponse | null;
  busy: boolean;
  error: NexusSparqlError | null;
}>;
export default SparqlQueryResults;
