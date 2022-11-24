import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
declare type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;
declare const AddWorkspaceContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  studio: StudioResource;
  onAddWorkspace?(): void;
  showModal: boolean;
  onCancel(): void;
}>;
export default AddWorkspaceContainer;
