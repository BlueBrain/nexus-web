import * as React from 'react';
export declare const DASHBOARD_TYPE = 'StudioDashboard';
declare const CreateDashboardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  viewId?: string;
  showCreateModal: boolean;
  onCancel(): void;
  onSuccess?(): void;
}>;
export default CreateDashboardContainer;
