import * as React from 'react';
declare const ResourceEditorContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  defaultExpanded?: boolean;
  defaultEditable?: boolean;
  onSubmit: (value: object) => void;
  onExpanded?: (expanded: boolean) => void;
  tabChange?: boolean;
  showMetadataToggle?: boolean;
}>;
export default ResourceEditorContainer;
