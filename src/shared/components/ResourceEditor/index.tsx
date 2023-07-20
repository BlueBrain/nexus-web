import * as React from 'react';
import { Button, Switch } from 'antd';
import { useLocation } from 'react-router';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { AccessControl } from '@bbp/react-nexus';
import codemiror from 'codemirror';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';

import CodeEditor from './CodeEditor';
import { RootState } from '../../store/reducers';
import { useEditorPopover, useEditorTooltip } from './useEditorTooltip';
import { DATA_EXPLORER_GRAPH_FLOW_PATH } from '../../store/reducers/data-explorer';
import ResourceResolutionCache from './ResourcesLRUCache';
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
  orgLabel: string;
  projectLabel: string;
  showFullScreen: boolean;
  showControlPanel?: boolean;
  onFullScreen(): void;
}

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
    orgLabel,
    projectLabel,
    showFullScreen,
    onFullScreen,
    showControlPanel = true,
  } = props;
  const location = useLocation();
  const [isEditing, setEditing] = React.useState(editing);
  const [valid, setValid] = React.useState(true);
  const [parsedValue, setParsedValue] = React.useState(rawData);
  const [stringValue, setStringValue] = React.useState(
    JSON.stringify(rawData, null, 2)
  );
  const {
    dataExplorer: { fullscreen },
    oidc,
  } = useSelector((state: RootState) => ({
    dataExplorer: state.dataExplorer,
    oidc: state.oidc,
    config: state.config,
  }));
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

  React.useEffect(() => {
    setEditing(false);
    setStringValue(JSON.stringify(rawData, null, 2)); // Update copy of the rawData for the editor.
    setParsedValue(rawData); // Update parsed value for submit.
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

  useEditorTooltip({
    orgLabel,
    projectLabel,
    isEditing,
    ref: codeMirorRef,
  });
  useEditorPopover({
    orgLabel,
    projectLabel,
    ref: codeMirorRef,
  });

  React.useEffect(() => {
    return () => {
      if (location.pathname !== DATA_EXPLORER_GRAPH_FLOW_PATH) {
        ResourceResolutionCache.clear();
      }
    };
  }, [ResourceResolutionCache, location]);

  return (
    <div
      data-testid="resource-editor"
      className={valid ? 'resource-editor' : 'resource-editor _invalid'}
    >
      {showControlPanel && (
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

          <div className="editor-controls-panel">
            <div className="left-side">
              {showFullScreen && (
                <div className="full-screen-switch__wrapper">
                  <span>Fullscreen</span>
                  <Switch
                    aria-label="fullscreen switch"
                    className="full-screen-switch"
                    checked={fullscreen}
                    onChange={onFullScreen}
                    style={switchMarginRight}
                  />
                </div>
              )}
            </div>
            <div className="right-side">
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
              <AccessControl
                path={[`${orgLabel}/${projectLabel}`]}
                permissions={['resources/write']}
                noAccessComponent={() => <></>}
              >
                <Button
                  role="submit"
                  icon={<SaveOutlined />}
                  type="primary"
                  size="small"
                  onClick={handleSubmit}
                  disabled={!valid || !editable || !isEditing}
                >
                  Save
                </Button>
              </AccessControl>
              {editable && isEditing && (
                <Button danger size="small" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <CodeEditor
        busy={busy}
        ref={codeMirorRef}
        value={stringValue}
        editable={editable}
        handleChange={handleChange}
        keyFoldCode={keyFoldCode}
        fullscreen={fullscreen}
      />
    </div>
  );
};

export default ResourceEditor;
