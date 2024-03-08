import * as codemirror from 'codemirror';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/display/placeholder';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/sparql/sparql';
import 'codemirror/theme/base16-light.css';
import { FC, useRef } from 'react';
import { UnControlled as UnControlledCodeMirror } from 'react-codemirror2';
import './SparqlQueryInput.scss';

const SparqlQueryInput: FC<{
  value?: string;
  onChange?: (query: string) => void;
}> = ({ value = '', onChange }) => {
  const editor = useRef<codemirror.Editor>();
  const wrapper = useRef(null);

  const handleChange = (_: any, __: any, value: string) => {
    onChange?.(value);
  };

  return (
    <div className="sparql-input">
      <div className="code">
        <UnControlledCodeMirror
          ref={wrapper}
          autoCursor={false}
          value={value}
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
          onChange={handleChange}
          editorDidMount={e => {
            (editor as React.MutableRefObject<codemirror.Editor>).current = e;
          }}
          editorWillUnmount={() => {
            const editorWrapper = (editor as React.MutableRefObject<
              CodeMirror.Editor
            >).current.getWrapperElement();
            if (editor) editorWrapper.remove();
            if (wrapper.current) {
              (wrapper.current as { hydrated: boolean }).hydrated = false;
            }
          }}
        />
      </div>
    </div>
  );
};

export default SparqlQueryInput;
