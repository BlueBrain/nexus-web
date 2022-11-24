import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
export declare type WorkspaceResource = Resource<{
  label: string;
  description?: string;
  dashboards?: [string];
}>;
declare const WorkspaceEditorForm: React.FC<{
  saveWorkspace?(label: string, description?: string): void;
  workspace?: WorkspaceResource | null;
}>;
export default WorkspaceEditorForm;
