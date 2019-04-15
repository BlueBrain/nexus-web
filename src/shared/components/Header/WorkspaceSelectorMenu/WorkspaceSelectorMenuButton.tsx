import * as React from 'react';
import { Button, Popover } from 'antd';
import { WorkspaceSelectorContainerProps } from './workspaceSelectorContainer';
import { Organization, Project } from '@bbp/nexus-sdk';
import WorkspaceSelectorMenu from './WorkspaceSelectMenu';

const getButtonLabel = (
  activeOrg: Organization | null,
  activeProject: Project | null
) => (activeProject ? activeProject.label : 'Projects');

export interface WorkspaceSelectorMenuButtonProps
  extends WorkspaceSelectorContainerProps {}

const WorkspaceSelectorMenuButton: React.FunctionComponent<
  WorkspaceSelectorMenuButtonProps
> = props => {
  const { activeOrg, activeProject } = props;
  return (
    <Popover
      placement="bottomLeft"
      content={<WorkspaceSelectorMenu {...props} />}
      trigger="click"
    >
      <Button>{getButtonLabel(activeOrg, activeProject)}</Button>
    </Popover>
  );
};

export default WorkspaceSelectorMenuButton;
