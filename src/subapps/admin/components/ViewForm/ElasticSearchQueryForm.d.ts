import * as React from 'react';
import { ElasticSearchViewQueryResponse } from '@bbp/nexus-sdk';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/javascript/javascript';
import './view-form.less';
/**
 * This is tricky because error can be KG error OR an ElasticSearch Error.
 *
 * In the case of ES, the reason message is nested within an error object
 */
declare type NexusESError = {
  reason?: string;
  error?: {
    reason?: string;
  };
};
declare const ElasticSearchQueryForm: React.FunctionComponent<{
  query: object;
  response: ElasticSearchViewQueryResponse<any> | null;
  busy: boolean;
  error: NexusESError | null;
  from: number;
  size: number;
  onPaginationChange: (page: number) => void;
  onQueryChange: (query: object) => void;
  onChangePageSize: (size: number) => void;
}>;
export default ElasticSearchQueryForm;
