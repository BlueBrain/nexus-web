import * as React from 'react';
import { Button, Icon, Switch, Spin } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';

import './ResourceEditor.less';

export interface ResourceEditorProps {
  rawData: { [key: string]: any };
  onSubmit: (rawData: { [key: string]: any }) => void;
  onFormatChange?(expanded: boolean): void;
  editable?: boolean;
  editing?: boolean;
  busy?: boolean;
  expanded?: boolean;
  showExpanded?: boolean;
}

const ResourceEditor: React.FunctionComponent<ResourceEditorProps> = props => {
  const {
    rawData,
    onFormatChange,
    onSubmit,
    editable = false,
    busy = false,
    editing = false,
    expanded = false,
    showExpanded = true,
  } = props;

  const [isEditing, setEditing] = React.useState(editing);
  const [valid, setValid] = React.useState(true);
  const [value, setValue] = React.useState(rawData);

  React.useEffect(() => {
    setEditing(false);
  }, [rawData]); // only runs when Editor receives new resource to edit

  const handleChange = (editor: any, data: any, value: any) => {
    if (!editable) {
      return;
    }
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
          {!editable && (
            <div className="feedback">
              <Icon type="info-circle" /> This resource cannot be edited
            </div>
          )}
          {editable && !isEditing && (
            <div className="feedback">
              <Icon type="info-circle" /> Directly edit this resource
            </div>
          )}
          {editable && isEditing && valid && (
            <div className="feedback _positive">
              <Icon type="check-circle" /> Valid
            </div>
          )}
          {editable && isEditing && !valid && (
            <div className="feedback _negative">
              <Icon type="exclamation-circle" /> Invalid JSON-LD
            </div>
          )}
        </div>
        <div className="controls">
          {showExpanded && !isEditing && valid && (
            <Switch
              checkedChildren="expanded"
              unCheckedChildren="expand"
              checked={expanded}
              onChange={onFormatChange}
            />
          )}
          {editable && isEditing && valid && (
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

      <Spin spinning={busy}>
        <CodeMirror
          value={JSON.stringify(rawData, null, 2)}
          options={{
            readOnly: !editable,
            mode: { name: 'javascript', json: true },
            theme: 'base16-light',
            lineNumbers: true,
            viewportMargin: Infinity,
          }}
          onChange={handleChange}
        />
      </Spin>
    </div>
  );
};

export default ResourceEditor;
