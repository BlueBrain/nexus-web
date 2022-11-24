import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { ResultTableFields } from '../../../shared/types/search';
export declare type Dashboard = {
  dashboard: string;
  view: string;
  fields?: ResultTableFields[];
};
export declare type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;
declare type WorkspaceMenuProps = {
  workspaceIds: string[];
  studioResource: StudioResource;
  onListUpdate(): void;
};
declare const WorkspaceMenu: React.FC<WorkspaceMenuProps>;
export default WorkspaceMenu;
