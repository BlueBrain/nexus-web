import * as React from 'react';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import './ResourceEditor.less';
export interface ResourceEditorProps {
  rawData: {
    [key: string]: any;
  };
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
declare const ResourceEditor: React.FunctionComponent<ResourceEditorProps>;
export default ResourceEditor;
