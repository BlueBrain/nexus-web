import * as React from 'react';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/lib/codemirror.css';
import './ElasticSearchQueryInput.less';
declare const ElasticSearchQueryInput: React.FunctionComponent<{
  value?: string;
  onChange?: (query: string) => void;
}>;
export default ElasticSearchQueryInput;
