import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { StudioItem } from '../../views/StudioListView';
import { useHistory } from 'react-router-dom';

import './StudioWorkspaceList.less';

const StudioWorkspaceList: React.FC<{
  workspaces: Resource[];
  studio: StudioItem;
}> = ({ workspaces, studio }) => {
  const history = useHistory();

  const makeWorkspaceUri = (workspaceId: string) => {
    const { orgLabel, projectLabel } = studio;

    return `/${orgLabel}/${projectLabel}/studios/${encodeURIComponent(
      studio.id
    )}?workspaceId=${encodeURIComponent(workspaceId)}`;
  };

  const goToWorkspace = (workspaceId: string) => {
    history.push(makeWorkspaceUri(workspaceId));
  };

  if (workspaces && workspaces.length === 0) {
    return (
      <div className="studio-workspace-list">
        <p className="workspace-description">
          It looks like there are no workspaces in this project.
        </p>
      </div>
    );
  }

  return (
    <div className="studio-workspace-list">
      {workspaces.map((workspace: Resource) => (
        <div key={workspace['@id']} className="list-item">
          <a
            href={makeWorkspaceUri(workspace['@id'])}
            onClick={e => {
              e.preventDefault();
              goToWorkspace(workspace['@id']);
            }}
          >
            <h3 className="workspace-title">{workspace.label}</h3>
          </a>
          <p className="workspace-description">{workspace.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StudioWorkspaceList;
