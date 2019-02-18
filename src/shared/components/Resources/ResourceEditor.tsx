import * as React from 'react';
import { Button, Icon } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import './ResourceEditor.less';

// Codemirror will not load on the server, so we need to make sure
// the language support code doesn't load either.
if (typeof window !== 'undefined') {
  require('codemirror/mode/javascript/javascript');
}

export interface ResourceEditorProps {
  rawData: { [key: string]: any }; // any object
  onSubmit: (rawData: { [key: string]: any }) => void;
}

const ResourceEditor: React.FunctionComponent<ResourceEditorProps> = props => {
  const { rawData, onSubmit } = props;
  const [editing, setEditing] = React.useState(false);
  const [valid, setValid] = React.useState(true);
  const [value, setValue] = React.useState(
    rawData
    // resource && {
    //   context: resource.context,
    //   type: resource.type,
    //   ...resource.data,
    // }
  );

  const handleChange = (editor: any, data: any, value: any) => {
    try {
      const parsedVal = JSON.parse(value);
      setValue(parsedVal);
      setEditing(true);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className={valid ? 'resource-editor' : 'resource-editor _invalid'}>
      <div className="control-panel">
        <div>
          {!editing && (
            <div className="feedback">Directly edit this resource</div>
          )}
          {editing && valid && (
            <div className="feedback _positive">
              <Icon type="check-circle" /> Valid
            </div>
          )}
          {editing && !valid && (
            <div className="feedback _negative">
              <Icon type="exclamation-circle" /> Invalid JSON-LD
            </div>
          )}
        </div>
        <div className="controls">
          {editing && valid && (
            <Button
              icon="save"
              type="primary"
              size="small"
              onClick={handleSubmit}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      <CodeMirror
        value={
          JSON.stringify(rawData, null, 2)
          //   JSON.stringify(
          //   {
          //     '@context': resource.context,
          //     '@type': resource.type,
          //     ...resource.data,
          //   },
          //   null,
          //   2
          // )
        }
        options={{
          mode: { name: 'javascript', json: true },
          theme: 'base16-light',
          lineNumbers: true,
          viewportMargin: Infinity,
        }}
        onChange={handleChange}
      />
    </div>
  );
};

export default ResourceEditor;
