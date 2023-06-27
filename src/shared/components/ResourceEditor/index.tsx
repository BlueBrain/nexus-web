import * as React from 'react';
import { Button, Switch } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import codemiror from 'codemirror';
import { isArray } from 'lodash';
import { clsx } from 'clsx';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import {
  UISettingsActionTypes,
  TUpdateJSONEditorPopoverAction,
} from '../../store/actions/ui-settings';
import isValidUrl, { externalLink } from '../../../utils/validUrl';
import { fetchResourceByResolver } from '../../../subapps/admin/components/Settings/ResolversSubView';
import {
  getOrgAndProjectFromResourceObject,
  getResourceLabel,
} from '../../utils';
import { TEditorPopoverResolvedData } from '../../store/reducers/ui-settings';
import CodeEditor from './CodeEditor';
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
type TToken = {
  string: string;
  start: number;
  end: number;
};
type TActionData = {
  type: typeof UISettingsActionTypes['UPDATE_JSON_EDITOR_POPOVER'];
  payload: TEditorPopoverResolvedData;
};

const LINE_HEIGHT = 50;
export const INDENT_UNIT = 4;
const switchMarginRight = { marginRight: 5 };
export const getNormalizedTypes = (types?: string | string[]) => {
  if (types) {
    if (isArray(types)) {
      return types.map(item => {
        if (isValidUrl(item)) {
          return item.split('/').pop()!;
        }
        return item;
      });
    }
    if (isValidUrl(types)) {
      return types.split('/').pop();
    }
    return [types];
  }
  return [];
};

const dispatchEvent = (
  dispatch: Dispatch<TUpdateJSONEditorPopoverAction>,
  data: TActionData
) => {
  return dispatch<{
    type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER;
    payload: TEditorPopoverResolvedData;
  }>({
    type: data.type,
    payload: data.payload,
  });
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

  const nexus = useNexusContext();
  const [loadingResolution, setLoadingResolution] = React.useState(false);
  const [isEditing, setEditing] = React.useState(editing);
  const [fullScreen, setFullScreen] = React.useState(false);
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
  const onLinksFound = () => {
    const elements = document.getElementsByClassName('cm-string');
    Array.from(elements).forEach(item => {
      const itemSpan = item as HTMLSpanElement;
      if (isValidUrl(itemSpan.innerText.replace(/^"|"$/g, ''))) {
        itemSpan.style.textDecoration = 'underline';
      }
    });
  };
  const onLinkClick = async (_: any, ev: MouseEvent) => {
    // ev.preventDefault();
    ev.stopPropagation();
    setLoadingResolution(true);
    const x = ev.pageX;
    const y = ev.pageY;
    const editorPosition = codeMirorRef.current?.coordsChar({
      left: x,
      top: y,
    });
    const token = (editorPosition
      ? codeMirorRef.current?.getTokenAt(editorPosition)
      : { start: 0, end: 0, string: '' }) as TToken;
    const tokenStart = editorPosition?.ch || 0;
    // const left = x - ((tokenStart - token.start) * 8);
    const left = x - LINE_HEIGHT;
    const top = y - LINE_HEIGHT;
    const defaultPaylaod = { top, left, open: true };
    const url = (token as TToken).string.replace(/\\/g, '').replace(/\"/g, '');
    if (isValidUrl(url)) {
      let data;
      try {
        // case-1: link resolved by the project resolver
        data = await fetchResourceByResolver({
          nexus,
          orgLabel,
          projectLabel,
          resourceId: encodeURIComponent(url),
        });
        const entity = getOrgAndProjectFromResourceObject(data);
        dispatchEvent(dispatch, {
          type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
          payload: {
            ...defaultPaylaod,
            error: null,
            resolvedAs: 'resource',
            results: {
              _self: data._self,
              title: getResourceLabel(data),
              types: getNormalizedTypes(data['@type']),
              resource: [
                entity?.orgLabel,
                entity?.projectLabel,
                data['@id'],
                data._rev,
              ],
            },
          },
        });
      } catch (error) {
        try {
          // case-2: link can not be resolved by the project resolver
          // then try to find it across all projects
          // it may be single resource, multiple resources or external resource
          // if no resource found then we consider it as an error
          data = await nexus.Resource.list(undefined, undefined, {
            locate: url,
          });
          dispatchEvent(dispatch, {
            type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
            payload: {
              ...defaultPaylaod,
              ...(externalLink(url) && !data._total
                ? {
                    resolvedAs: 'external',
                    results: {
                      _self: url,
                      title: url,
                      types: [],
                    },
                  }
                : !data._total
                ? {
                    error: 'No @id or _self has been resolved',
                    resolvedAs: 'error',
                  }
                : {
                    resolvedAs: 'resources',
                    results: data._results.map(item => {
                      const entity = getOrgAndProjectFromResourceObject(item);
                      return {
                        _self: item._self,
                        title: getResourceLabel(item),
                        types: getNormalizedTypes(item['@type']),
                        resource: [
                          entity?.orgLabel,
                          entity?.projectLabel,
                          item['@id'],
                          item._rev,
                        ],
                      };
                    }),
                  }),
            },
          });
        } catch (error) {
          // case-3: if an error occured when tring both resolution method above
          // we check if the resource is external
          if (externalLink(url)) {
            dispatchEvent(dispatch, {
              type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
              payload: {
                ...defaultPaylaod,
                resolvedAs: 'external',
                results: {
                  _self: url,
                  title: url,
                  types: [],
                },
              },
            });
          }
          // case-4: if not an external url then it will be an error
          else {
            dispatchEvent(dispatch, {
              type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
              payload: {
                ...defaultPaylaod,
                error,
                resolvedAs: 'error',
              },
            });
          }
        }
      }
    }
    setLoadingResolution(false);
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

  return (
    <div
      data-testId="resource-editor"
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
                checked={fullScreen}
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
            <Button
              role="submit"
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
      )}
      <CodeEditor
        busy={busy}
        value={stringValue}
        editable={editable}
        handleChange={handleChange}
        keyFoldCode={keyFoldCode}
        loadingResolution={loadingResolution}
        onLinkClick={onLinkClick}
        onLinksFound={onLinksFound}
        ref={codeMirorRef}
      />
    </div>
  );
};

export default ResourceEditor;
