import { WarningOutlined, SaveOutlined } from '@ant-design/icons';
import { AccessControl } from '@bbp/react-nexus';
import { Alert, Button, Switch } from 'antd';
import codemirror from 'codemirror';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/mode/javascript/javascript';

import { RootState } from '../../store/reducers';
import { DATA_EXPLORER_GRAPH_FLOW_PATH } from '../../store/reducers/data-explorer';
import CodeEditor from './CodeEditor';
import { LinterIssue } from './customLinter';
import './ResourceEditor.scss';
import ResourceResolutionCache from './ResourcesLRUCache';
import { useEditorPopover, useEditorTooltip } from './useEditorTooltip';

export interface ResourceEditorProps {
  busy?: boolean;
  orgLabel: string;
  editing?: boolean;
  editable?: boolean;
  expanded?: boolean;
  projectLabel: string;
  showMetadata?: boolean;
  showExpanded?: boolean;
  showFullScreen: boolean;
  showControlPanel?: boolean;
  showMetadataToggle?: boolean;
  rawData: { [key: string]: any };
  onFullScreen(): void;
  onFormatChange?(expanded: boolean): void;
  onMetadataChange?(expanded: boolean): void;
  onSubmit: (rawData: { [key: string]: any }) => void;
}

const switchMarginRight = { marginRight: 5 };

const ResourceEditor: React.FC<ResourceEditorProps> = props => {
  const {
    rawData,
    orgLabel,
    busy = false,
    projectLabel,
    showFullScreen,
    editing = false,
    editable = false,
    expanded = false,
    showExpanded = true,
    showMetadata = false,
    showControlPanel = true,
    showMetadataToggle = true,
    onSubmit,
    onFullScreen,
    onFormatChange,
    onMetadataChange,
  } = props;
  const location = useLocation();
  const [isEditing, setEditing] = useState(editing);
  const [isValidJSON, setIsValidJSON] = useState(true);
  const [linterIssues, setLinterIssues] = useState<LinterIssue[]>([]);
  const [parsedValue, setParsedValue] = useState(rawData);
  const [stringValue, setStringValue] = useState(
    JSON.stringify(rawData, null, 2)
  );
  const {
    dataExplorer: { fullscreen },
  } = useSelector((state: RootState) => ({
    dataExplorer: state.dataExplorer,
    oidc: state.oidc,
    config: state.config,
  }));
  const keyFoldCode = (cm: any) => {
    cm.foldCode(cm.getCursor());
  };
  const codeMirrorRef = useRef<codemirror.Editor>();
  const [foldCodeMirror, setFoldCodeMirror] = useState<boolean>(false);
  const onFoldChange = () => {
    if (codeMirrorRef.current) {
      if (foldCodeMirror) {
        codeMirrorRef.current.execCommand('unfoldAll');
        setFoldCodeMirror(stateFoldCodeMirror => !stateFoldCodeMirror);
      } else {
        codeMirrorRef.current.execCommand('foldAll');
        codeMirrorRef.current.foldCode(0);
        setFoldCodeMirror(stateFoldCodeMirror => !stateFoldCodeMirror);
      }
    }
  };

  const onFormatChangeFold = (expanded: boolean) => {
    if (codeMirrorRef.current) {
      codeMirrorRef.current.execCommand('foldAll');
      codeMirrorRef.current.foldCode(0);
      setFoldCodeMirror(() => false);
    }
    onFormatChange?.(expanded);
  };

  const onMetadataChangeFold = (checked: boolean) => {
    if (codeMirrorRef.current) {
      codeMirrorRef.current.execCommand('foldAll');
      codeMirrorRef.current.foldCode(0);
      setFoldCodeMirror(() => false);
    }
    onMetadataChange?.(checked);
  };

  React.useEffect(() => {
    setEditing(false);
    setStringValue(JSON.stringify(rawData, null, 2)); // Update copy of the rawData for the editor.
    setParsedValue(rawData); // Update parsed value for submit.

    return () => setFoldCodeMirror(false);
  }, [rawData]); // only runs when Editor receives new resource to edit

  const handleChange = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    if (!editable) {
      return;
    }

    try {
      // Validate if JSON is valid
      const parsedJSON = JSON.parse(value);
      setParsedValue(parsedJSON);
      setIsValidJSON(true);
    } catch (error) {
      setIsValidJSON(false);
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
    setIsValidJSON(true);
    setEditing(false);
  };

  const handleLintError = useCallback(
    (errors: LinterIssue[]) => {
      setLinterIssues(errors);
    },
    [setLinterIssues]
  );

  useEditorTooltip({
    orgLabel,
    projectLabel,
    isEditing,
    ref: codeMirrorRef,
  });

  useEditorPopover({
    orgLabel,
    projectLabel,
    ref: codeMirrorRef,
  });

  useEffect(() => {
    setEditing(false);
    setStringValue(JSON.stringify(rawData, null, 2)); // Update copy of the rawData for the editor
    setParsedValue(rawData); // Update parsed value for submit
    return () => {
      setFoldCodeMirror(false);
    };
  }, [rawData]); // Only runs when Editor receives new resource to edit

  useEffect(() => {
    return () => {
      if (location.pathname !== DATA_EXPLORER_GRAPH_FLOW_PATH) {
        ResourceResolutionCache.clear();
      }
    };
  }, [ResourceResolutionCache, location]);

  return (
    <div
      data-testid="resource-editor"
      className={isValidJSON ? 'resource-editor' : 'resource-editor _invalid'}
    >
      {showControlPanel && (
        <div className="control-panel">
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
                checked={foldCodeMirror}
                onChange={onFoldChange}
                style={switchMarginRight}
              />
              {!expanded && !isEditing && isValidJSON && showMetadataToggle && (
                <Switch
                  checkedChildren="Metadata"
                  unCheckedChildren="Show Metadata"
                  checked={showMetadata}
                  onChange={checked => onMetadataChangeFold(checked)}
                  style={switchMarginRight}
                />
              )}
              {showExpanded && !isEditing && isValidJSON && (
                <Switch
                  checkedChildren="Expanded"
                  unCheckedChildren="Expand"
                  checked={expanded}
                  onChange={expanded => onFormatChangeFold(expanded)}
                  style={switchMarginRight}
                />
              )}
              <AccessControl
                path={[`${orgLabel}/${projectLabel}`]}
                permissions={['resources/write']}
                noAccessComponent={() => <></>}
              >
                {editable && isEditing && (
                  <Button
                    className="cancel"
                    danger
                    size="small"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  role="submit"
                  icon={<SaveOutlined />}
                  type="primary"
                  size="small"
                  onClick={handleSubmit}
                  disabled={
                    !isValidJSON ||
                    !editable ||
                    !isEditing ||
                    linterIssues.length > 0
                  }
                >
                  Save changes
                </Button>
              </AccessControl>
            </div>
          </div>
        </div>
      )}

      {/* Show to the user if there's a custom linter issue */}
      {isValidJSON && linterIssues.length > 0 && (
        <Alert
          message={
            <>
              <WarningOutlined style={{ marginRight: '1em' }} />{' '}
              <span style={{ fontWeight: 'bold' }}>
                Warning on Line {linterIssues[0].line}:{' '}
              </span>
              {linterIssues[0].message}.
            </>
          }
          style={{ border: 'none', margin: '0' }}
          type="warning"
        />
      )}

      {/* Show to the user if there's a general issue with the JSON-LD */}
      {!isValidJSON && (
        <Alert
          message={
            <>
              <WarningOutlined style={{ marginRight: '1em' }} />
              <span style={{ fontWeight: 'bold' }}>
                Error: Incorrect JSON-LD Format.
              </span>{' '}
              Please check the format and fix any errors.
            </>
          }
          style={{ border: 'none' }}
          type="error"
        />
      )}

      <CodeEditor
        busy={busy}
        ref={codeMirrorRef}
        value={stringValue}
        editable={editable}
        handleChange={handleChange}
        keyFoldCode={keyFoldCode}
        fullscreen={fullscreen}
        // @ts-ignore
        onLintError={handleLintError}
      />
    </div>
  );
};

export default ResourceEditor;
