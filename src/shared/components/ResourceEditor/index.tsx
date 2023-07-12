import * as React from 'react';
import { Button, Switch } from 'antd';
import { useLocation } from 'react-router';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import codemiror from 'codemirror';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';

import isValidUrl, {
  isAllowedProtocal,
  isStorageLink,
  isUrlCurieFormat,
} from '../../../utils/validUrl';
import CodeEditor from './CodeEditor';
import { RootState } from '../../store/reducers';
import {
  useEditorPopover,
  useEditorTooltip,
  CODEMIRROR_LINK_CLASS,
} from './useEditorTooltip';
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

const isClickableLine = (url: string) => {
  return (
    isValidUrl(url) &&
    isAllowedProtocal(url) &&
    !isUrlCurieFormat(url) &&
    !isStorageLink(url)
  );
};

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
    dataExplorer: { limited },
    oidc,
    config: { apiEndpoint },
  } = useSelector((state: RootState) => ({
    dataExplorer: state.dataExplorer,
    oidc: state.oidc,
    config: state.config,
  }));
  const userAuthenticated = oidc.user && oidc.user.access_token;
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
  const onLinksFound = () => {
    const elements = document.getElementsByClassName('cm-string');
    Array.from(elements).forEach((item, index) => {
      const itemSpan = item as HTMLSpanElement;
      const url = itemSpan.innerText.replace(/^"|"$/g, '');
      if (isClickableLine(url)) {
        itemSpan.classList.add(CODEMIRROR_LINK_CLASS);
      }
    });
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

          <div className="controls">
            {showFullScreen && (
              <Switch
                checkedChildren="Standard Screen"
                unCheckedChildren="Full Screen"
                checked={limited}
                onChange={onFullScreen}
                style={switchMarginRight}
              />
            )}
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
            {userAuthenticated && (
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
            )}{' '}
            {editable && isEditing && (
              <Button danger size="small" onClick={handleCancel}>
                Cancel
              </Button>
            )}
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
        onLinksFound={onLinksFound}
        fullscreen={limited}
      />
    </div>
  );
};

export default ResourceEditor;
