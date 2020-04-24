import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';

const StudioWorkspaceList: React.FC<{ workspaces: Resource[] }> = ({
  workspaces,
}) => {
  return (
    <div>
      {workspaces && workspaces.length > 0 ? (
        workspaces.map((workspace: Resource) => (
          <div>
            <h3 className="workspace-title">{workspace.label}</h3>
            <p>{workspace.description}</p>
          </div>
        ))
      ) : (
        <p>It looks like there are workspace in this project.</p>
      )}
    </div>
  );
};

export default StudioWorkspaceList;
