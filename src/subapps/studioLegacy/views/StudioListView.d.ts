import * as React from 'react';
import '../studio.less';
export declare type StudioItem = {
  id: string;
  label: string;
  description?: string;
  workspaces?: string[];
  projectLabel: string;
  orgLabel: string;
};
declare const StudioListView: React.FC;
export default StudioListView;
