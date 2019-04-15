import * as React from 'react';
import { Button, Popover } from 'antd';
import { WorkspaceSelectorContainerProps } from './workspaceSelectorContainer';
import { Organization, Project } from '@bbp/nexus-sdk';

const getButtonLabel = (
  activeOrg: Organization | null,
  activeProject: Project | null
) => (activeProject ? activeProject.label : 'Projects');

export interface WorkspaceSelectorMenuButtonProps
  extends WorkspaceSelectorContainerProps {}

const WorkspaceSelectorMenuButton: React.FunctionComponent<
  WorkspaceSelectorMenuButtonProps
> = ({ activeOrg, activeProject }) => (
  <Popover
    placement="bottomLeft"
    content={<h1>Hello World</h1>}
    trigger="click"
  >
    <Button>{getButtonLabel(activeOrg, activeProject)}</Button>
  </Popover>
);

export default WorkspaceSelectorMenuButton;
