import * as React from 'react';
import { Button, Switch, Spin } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import codemiror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import isValidUrl from '../../../utils/validUrl';

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
type TToken = {
  string: string;
};

const switchMarginRight = { marginRight: 5 };
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
  const dispatch = useDispatch();
  const keyFoldCode = (cm: any) => {
    cm.foldCode(cm.getCursor());
  };
  const codeMirorRef = React.useRef<codemiror.Editor>();
  const [foldCodeMiror, setFoldCodeMiror] = React.useState<boolean>(false);
  const onFoldChange = () => {
    if (codeMirorRef.current) {
      if (foldCodeMiror) {
        codeMirorRef.current.execCommand('unfoldAll');
        setFoldCodeMiror(stateFoldCodeMiror => !stateFoldCodeMiror);
      } else {
        codeMirorRef.current.execCommand('foldAll');
        codeMirorRef.current.foldCode(0);
        setFoldCodeMiror(stateFoldCodeMiror => !stateFoldCodeMiror);
      }
    }
  };
  const onFormatChangeFold = (expanded: boolean) => {
    if (codeMirorRef.current) {
      codeMirorRef.current.execCommand('foldAll');
      codeMirorRef.current.foldCode(0);
      setFoldCodeMiror(() => false);
    }
    onFormatChange?.(expanded);
  };
  const onMetadataChangeFold = (checked: boolean) => {
    if (codeMirorRef.current) {
      codeMirorRef.current.execCommand('foldAll');
      codeMirorRef.current.foldCode(0);
      setFoldCodeMiror(() => false);
    }
    onMetadataChange?.(checked);
  };
  const onLinkClick = (_: any, ev: MouseEvent) => {
    const x = ev.pageX;
    const y = ev.pageY;
    const coords = { left: x, top: y };
    const editorPosition = codeMirorRef.current?.coordsChar(coords);
    const token = editorPosition
      ? codeMirorRef.current?.getTokenAt(editorPosition)
      : '';
    const url = (token as TToken).string.replace(/\\/g, '').replace(/\"/g, '');
    if (isValidUrl(url)) {
      console.log('🎉 found one');
      dispatch({
        type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
        payload: {
          left: x - 10,
          top: y - 55,
          open: true,
          link: url,
        },
      });
    } else {
      dispatch({
        type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
        payload: {
          left: 0,
          top: 0,
          open: false,
          link: '',
        },
      });
    }
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
          editorDidMount={editor => {
            codeMirorRef.current = editor;
          }}
          onScroll={e => {
            const cursor = e.cursorCoords();
            dispatch({
              type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
              payload: {
                left: cursor.left - 10,
                top: cursor.top - 55,
              },
            });
          }}
          onMouseDown={onLinkClick}
        />
      </Spin>
    );
  };

  React.useEffect(() => {
    setEditing(false);
    setStringValue(JSON.stringify(rawData, null, 2)); // Update copy of the rawData for the editor.
    setParsedValue(rawData); // Update parsed value for submit.
    // onFormatChange?.(false);
    // onMetadataChange?.(false);
    return () => {
      setFoldCodeMiror(false);
    };
  }, [rawData]); // only runs when Editor receives new resource to edit

  const handleChange = (editor: any, data: any, value: any) => {
    editor;
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
          <Switch
            checkedChildren="Unfold"
            unCheckedChildren="Fold"
            checked={foldCodeMiror}
            onChange={onFoldChange}
            style={switchMarginRight}
          />
          {!expanded && !isEditing && valid && showMetadataToggle && (
            <Switch
              checkedChildren="Metadata"
              unCheckedChildren="Show Metadata"
              checked={showMetadata}
              onChange={checked => onMetadataChangeFold(checked)}
              style={switchMarginRight}
            />
          )}
          {showExpanded && !isEditing && valid && (
            <Switch
              checkedChildren="Expanded"
              unCheckedChildren="Expand"
              checked={expanded}
              onChange={expaned => onFormatChangeFold(expanded)}
              style={switchMarginRight}
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
