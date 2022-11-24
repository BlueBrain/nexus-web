import * as React from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/theme/base16-light.css';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/sparql/sparql';
import './SparqlQueryInput.less';
declare const SparqlQueryInput: React.FunctionComponent<{
  value?: string;
  onChange?: (query: string) => void;
}>;
export default SparqlQueryInput;
