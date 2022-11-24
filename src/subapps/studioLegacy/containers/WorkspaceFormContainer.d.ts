import * as React from 'react';
declare type WorkspaceFormProps = {
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  onCancel: () => void;
  onSuccess?: () => void;
};
declare const WorkspaceForm: React.FunctionComponent<WorkspaceFormProps>;
export default WorkspaceForm;
