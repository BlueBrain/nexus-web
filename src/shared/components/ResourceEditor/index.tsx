import * as React from 'react';
import { Button, Icon, Switch, Spin } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';

import './ResourceEditor.less';

export interface ResourceEditorProps {
  rawData: { [key: string]: any };
  onSubmit: (rawData: { [key: string]: any }) => void;
  onFormatChange?(expanded: boolean): void;
  onMetadataChange?(expanded: boolean): void;
  editable?: boolean;
  editing?: boolean;
  busy?: boolean;
  expanded?: boolean;
  showMetadata?: boolean;
  showExpanded?: boolean;
}

const ResourceEditor: React.FunctionComponent<ResourceEditorProps> = props => {
  const {
    rawData,
    onFormatChange,
    onMetadataChange,
    onSubmit,
    editable = false,
    busy = false,
    editing = false,
    expanded = false,
    showMetadata = false,
    showExpanded = true,
  } = props;

  const [isEditing, setEditing] = React.useState(editing);
  const [valid, setValid] = React.useState(true);
  const [parsedValue, setParsedValue] = React.useState(rawData);
  const [stringValue, setStringValue] = React.useState(JSON.stringify(rawData, null, 2));

  const renderCodeMirror = (value: string) => {
    return (
      <Spin spinning={busy}>
        <CodeMirror
          value={value}
          autoCursor={false}
          detach={false}
          options={{
            readOnly: !editable,
            mode: { name: 'javascript', json: true },
            theme: 'base16-light',
            lineNumbers: true,
            lineWrapping: true,
            viewportMargin: Infinity,
          }}
          onChange={handleChange}
        />
      </Spin>
    );
  };

  React.useEffect(() => {
    setEditing(false);
    setStringValue(JSON.stringify(rawData, null, 2)); // Update copy of the rawData for the editor.
    setParsedValue(rawData); // Update parsed value for submit.
  }, [rawData]); // only runs when Editor receives new resource to edit

  const handleChange = (editor: any, data: any, value: any) => {
    if (!editable || value === JSON.stringify(rawData, null, 2)) {
      return;
    }
    try {
      const parsedVal = JSON.parse(value);
      setParsedValue(parsedVal);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
    setEditing(true);
    setStringValue(value);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(parsedValue);
    }
  };

  const handleCancel = () => {
    setStringValue(JSON.stringify(rawData, null, 2));
    setValid(true);
    setEditing(false);
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
          {editable && !isEditing && valid && (
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
          {!expanded && !isEditing && valid && (
            <>
              <Switch
                checkedChildren="Metadata"
                unCheckedChildren="Show Metadata"
                checked={showMetadata}
                onChange={onMetadataChange}
              />{' '}
            </>
          )}
          {showExpanded && !isEditing && valid && (
            <Switch
              checkedChildren="expanded"
              unCheckedChildren="expand"
              checked={expanded}
              onChange={onFormatChange}
            />
          )}

          {editable && isEditing && (
            <>
            {valid ? 
              <Button
                icon="save"
                type="primary"
                size="small"
                onClick={handleSubmit}
              >
                Save
              </Button> : null }
              {' '}
              <Button type="danger" size="small" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {renderCodeMirror(stringValue)}
    </div>
  );
};

export default ResourceEditor;
