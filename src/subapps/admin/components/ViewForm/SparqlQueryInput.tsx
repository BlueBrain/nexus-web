import * as React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';

import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/sparql/sparql';

import './SparqlQueryInput.less';

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
          options={{
            mode: { name: 'sparql' },
            theme: 'base16-light',
            placeholder: 'Enter a valid SPARQL query',
            lineNumbers: true,
            viewportMargin: Infinity,
          }}
          onBeforeChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SparqlQueryInput;
