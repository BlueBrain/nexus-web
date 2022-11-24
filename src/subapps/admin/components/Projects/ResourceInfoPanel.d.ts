import * as React from 'react';
import './ResourceInfoPanel.less';
declare const ResourceInfoPanel: React.FC<{
  typeStats: any;
  relations: any;
  panelVisibility: boolean;
  drawerContainer?: HTMLDivElement | null;
  onClickClose: () => void;
}>;
export default ResourceInfoPanel;
