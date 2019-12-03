import * as React from 'react';
import { Button, Icon, Switch, Spin } from 'antd';
import { UnControlled as CodeMirror, IInstance } from 'react-codemirror2';
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
  const [value, setValue] = React.useState(rawData);

  const renderCodeMirror = (value: { [key: string]: any }) => {
    return (
      <Spin spinning={busy}>
        <CodeMirror
          value={JSON.stringify(value, null, 2)}
          autoCursor={false}
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
  }, [rawData]); // only runs when Editor receives new resource to edit

  const handleChange = (editor: any, data: any, value: any) => {
    if (!editable || value === JSON.stringify(rawData, null, 2)) {
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

  const handleCancel = () => {
    setValue(rawData);
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

          {editable && isEditing && valid && (
            <>
              <Button
                icon="save"
                type="primary"
                size="small"
                onClick={handleSubmit}
              >
                Save
              </Button>{' '}
              <Button type="danger" size="small" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {renderCodeMirror(value)}
    </div>
  );
};

export default ResourceEditor;
