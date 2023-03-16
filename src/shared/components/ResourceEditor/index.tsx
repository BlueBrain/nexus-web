import * as React from 'react';
import { Button, Switch, Spin } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';

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
  showMetadataToggle?: boolean;
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
    showMetadataToggle = true,
  } = props;

  const [isEditing, setEditing] = React.useState(editing);
  const [valid, setValid] = React.useState(true);
  const [parsedValue, setParsedValue] = React.useState(rawData);
  const [stringValue, setStringValue] = React.useState(
    JSON.stringify(rawData, null, 2)
  );

  const keyFoldCode = (cm: any) => {
    cm.foldCode(cm.getCursor());
  };
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
            foldGutter: true,
            // @ts-ignore
            foldCode: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
              'Ctrl-Q': keyFoldCode,
            },
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
    if (!editable) {
      return;
    }

    try {
      const parsedVal = JSON.parse(value);
      setParsedValue(parsedVal);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
    setStringValue(value);
    setEditing(value !== JSON.stringify(rawData, null, 2));
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
          {editable && isEditing && valid && (
            <div className="feedback _positive">
              <CheckCircleOutlined /> Valid
            </div>
          )}
          {editable && isEditing && !valid && (
            <div className="feedback _negative">
              <ExclamationCircleOutlined /> Invalid JSON-LD
            </div>
          )}
        </div>

        <div className="controls">
          {!expanded && !isEditing && valid && showMetadataToggle && (
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
          <Button
            icon={<SaveOutlined />}
            type="primary"
            size="small"
            onClick={handleSubmit}
            disabled={!valid || !editable || !isEditing}
          >
            Save
          </Button>{' '}
          {editable && isEditing && (
            <Button danger size="small" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {renderCodeMirror(stringValue)}
    </div>
  );
};

export default ResourceEditor;
