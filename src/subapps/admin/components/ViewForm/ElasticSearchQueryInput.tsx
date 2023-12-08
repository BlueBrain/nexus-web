import './ElasticSearchQueryInput.scss';
import 'codemirror/addon/display/placeholder';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/lib/codemirror.css';

// import { UnControlled as CodeMirror } from 'react-codemirror2';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';

const ElasticSearchQueryInput: React.FunctionComponent<{
  value?: string;
  onChange?: (query: string) => void;
}> = ({ value = '', onChange }) => {
  const [valid, setValid] = React.useState(true);

  const handleChange = (editor: any, data: any, value: string) => {
    try {
      JSON.parse(value);
      onChange && onChange(value);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
  };

  return (
    <div className="es-input">
      <div className="control-panel">
        <div>
          <div className={`feedback ${valid ? '_positive' : '_negative'}`}>
            {valid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}{' '}
            {valid ? 'Valid JSON' : 'Invalid JSON'}
          </div>
        </div>
      </div>
      <div className="code">
        <CodeMirror
          value={value}
          options={{
            mode: { name: 'javascript', json: true },
            theme: 'base16-light',
            lineNumbers: true,
            viewportMargin: Infinity,
            placeholder: 'Enter a valid ElasticSearch query',
          }}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default ElasticSearchQueryInput;
