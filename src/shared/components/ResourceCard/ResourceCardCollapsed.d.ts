import * as React from 'react';
declare const ResourceCardCollapsed: React.FunctionComponent<{
  onClickExpand?(): void;
  label: string;
  resourceUrl: string;
  busy: boolean;
  types?: string[];
  isExternal?: boolean;
}>;
export default ResourceCardCollapsed;
