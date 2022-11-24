import * as React from 'react';
import { DashboardPayload } from '../../components/DashboardEditor/DashboardConfigEditor';
declare const DashboardEditorContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  dashboardId: string;
  dashboardRev: number;
  dashboard: DashboardPayload;
  viewId?: string;
  showEditModal: boolean;
  setShowEditModal(showEditModal: boolean): void;
  onSuccess?(): void;
}>;
export default DashboardEditorContainer;
