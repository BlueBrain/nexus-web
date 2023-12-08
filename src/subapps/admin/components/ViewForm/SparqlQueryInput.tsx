import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/theme/base16-light.css';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/sparql/sparql';
import './SparqlQueryInput.scss';

import React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';

const SparqlQueryInput: React.FunctionComponent<{
  value?: string;
  onChange?: (query: string) => void;
}> = ({ value = '', onChange }) => {
  const handleChange = (editor: any, data: any, value: string) => {
    onChange && onChange(value);
  };

  return (
    <div className="sparql-input">
      <div className="code">
        <CodeMirror
          value={value}
          autoCursor={true}
          autoScroll={true}
          options={{
            mode: { name: 'sparql' },
            theme: 'base16-light',
            placeholder: 'Enter a valid SPARQL query',
            viewportMargin: Infinity,
            lineNumbers: true,
            lineWrapping: true,
            autoRefresh: true,
          }}
          onBeforeChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SparqlQueryInput;
