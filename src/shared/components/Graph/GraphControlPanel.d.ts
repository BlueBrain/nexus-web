import * as React from 'react';
import './GraphControlPanel.less';
declare const GraphControlPanel: React.FunctionComponent<{
  label: string;
  onReset?(): void;
  onCollapse?(): void;
  collapsed?: boolean;
  onLayoutChange?(type: string): void;
  layout?: string;
  loading: boolean;
  onRecenter?(): void;
}>;
export default GraphControlPanel;
