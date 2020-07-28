import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { StudioItem } from '../views/StudioListView';

import './StudioWorkspaceList.less';

const StudioWorkspaceList: React.FC<{
  workspaces: Resource[];
  studio: StudioItem;
  goToWorkspace(url: string): void;
}> = ({ workspaces, studio, goToWorkspace }) => {
  const makeWorkspaceUri = (workspaceId: string) => {
    const { orgLabel, projectLabel, id } = studio;

    return `/${orgLabel}/${projectLabel}/studios/${encodeURIComponent(
      id
    )}?workspaceId=${encodeURIComponent(workspaceId)}`;
  };

  if (workspaces && workspaces.length === 0) {
    return (
      <div className="studio-workspace-list">
        <p className="no-workspaces-message">
          It looks like there are no workspaces in this studio.
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
              goToWorkspace(makeWorkspaceUri(workspace['@id']));
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
